/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Loader from "./Loader";
import ResetEmailPopup from "./ResetEmailPopup";

const authFormSchema = (type: "sign-in" | "sign-up") => {
  return z.object({
    name:
      type === "sign-in"
        ? z.string().optional()
        : z
            .string()
            .min(3, { message: "Name must be at least 3 characters long." }),

    email: z.string().email({ message: "Please enter a valid email address." }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." }),
  });
};

const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const formSchema = authFormSchema(type);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email: email,
          password: password,
        });

        if (!result?.success) {
          toast.error(result?.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = values;
        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredentials.user.getIdToken();

        if (!idToken) {
          toast.error("Account does not exists. Please sign up.");
          return;
        }

        await signIn({ email, idToken });
        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      toast.error(`Something went wrong ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result) {
        const user = result.user;
        const idToken = await user?.getIdToken();

        if (!idToken) {
          toast.error("Something went wrong");
          return;
        }

        await signIn({ email: user.email!, idToken });
        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error: any) {
      toast.error(`Google Sign-In failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <>
      {isLoading && <Loader />}
      {!showResetPassword && (
        <section className="card-border lg:min-w-[566px]">
          <div className="flex flex-col gap-6 card py-14 px-10">
            <div className="flex flex-row gap-2 justify-center">
              <Image src="/logo.png" width={32} height={32} alt="logo" />
              <h2 className="text-primary-100">Intervue</h2>
            </div>
            <h3>Practice Job Interview with AI</h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6 mt-4 form"
              >
                {!isSignIn && (
                  <FormField
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="Enter Your Name"
                  />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter Your Email Address"
                />
                <FormField
                  control={form.control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter Your Password"
                />

                {isSignIn && (
                  <div className="w-full text-right -mt-5 text-sm">
                    <p
                      onClick={() => setShowResetPassword(true)}
                      className="text-light-400 duration-150 hover:text-light-100 cursor-pointer"
                    >
                      Can&apos;t remember your password?
                    </p>
                  </div>
                )}

                <Button className="btn" type="submit">
                  {isSignIn ? "Sign In" : "Create an Account"}
                </Button>

                <hr />

                {/* <Button
                  className="btn-google"
                  type="button"
                  onClick={handleGoogleSignIn}
                >
                  <FcGoogle />
                  Continue with Google
                </Button> */}

                <p className="text-center">
                  {isSignIn
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <Link
                    href={isSignIn ? "/sign-up" : "/sign-in"}
                    className="font-medium text-primary-100 ml-1"
                  >
                    {isSignIn ? "Sign Up" : "Sign In"}
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </section>
      )}
      {showResetPassword && (
        <ResetEmailPopup setShowResetPassword={setShowResetPassword} />
      )}
    </>
  );
};

export default AuthForm;
