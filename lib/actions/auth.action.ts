/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  // Validate inputs
  if (!uid || !name || !email) {
    return {
      success: false,
      message: "Missing required fields.",
    };
  }

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
    return {
      success: false,
      message:
        e.code === "auth/email-already-exists"
          ? "Email already exists"
          : "Failed to create an account",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  // Validate inputs
  if (!email || !idToken) {
    return {
      success: false,
      message: "Missing email or token.",
    };
  }

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist.",
      };
    }

    await setSessionCookie(idToken);
    return { success: true };
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

  try {
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
  } catch (e) {
    console.error("Error setting session cookie:", e);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    if (!decodedClaims?.uid) return null;

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (e: any) {
    console.error("Error fetching current user:", e);
    return null;
  }
}

export async function isAuthenticated() {
  return !!(await getCurrentUser());
}

export async function forgotPassword(email: string) {
  // Validate input
  if (!email) {
    return {
      success: false,
      message: "Email is required.",
    };
  }

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
    const actionCodeSettings = { url: continueUrl, handleCodeInApp: true };

    const resetLink = await auth.generatePasswordResetLink(
      email,
      actionCodeSettings
    );
    await sendResetEmail(email, resetLink);

    return {
      success: true,
      message: "Password reset link has been sent to your email.",
    };
  } catch (error: any) {
    console.error("Failed to generate password reset link:", error);
    return {
      success: false,
      message: error.message || "Failed to generate password reset link.",
    };
  }
}

async function sendResetEmail(email: string, resetLink: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      subject: "Intervue Password Reset Link",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset link sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email.");
  }
}
