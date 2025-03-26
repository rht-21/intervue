/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;
  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead.",
      };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (e: any) {
    console.error("Error creating a user", e);
    if (e.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "Email already exists",
      };
    }
  }

  return {
    success: false,
    message: "Failed to create an account",
  };
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;
  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist.",
      };
    }

    await setSessionCookie(idToken);
  } catch (e) {
    console.error(e);

    return {
      success: false,
      message: "Failed to log into an account.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: ONE_WEEK,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) {
      return null;
    }

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (e: any) {
    console.error(e);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}

export async function forgotPassword(email: string) {
  try {
    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userQuery.empty) {
      return {
        success: false,
        message: "No account found with this email.",
      };
    }

    const continueUrl = `${process.env.NEXT_PUBLIC_URL}/sign-in`;

    const actionCodeSettings = {
      url: continueUrl,
      handleCodeInApp: true,
    };

    const resetLink = await auth.generatePasswordResetLink(
      email,
      actionCodeSettings
    );

    console.log(`Reset link: ${resetLink}`);

    return {
      success: true,
      message: "Password reset link generated. Please check your email.",
    };
  } catch (error: any) {
    console.error("Failed to generate password reset link:", error);
    return {
      success: false,
      message: error.message || "Failed to generate password reset link.",
    };
  }
}
