"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Form, FormDescription } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import FormField from "@/components/FormField";
import { auth } from "@/firebase/client";

const resetFormSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

const ResetForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");
  const actionCode = searchParams.get("oobCode");
  const continueUrl = searchParams.get("continueUrl");

  const form = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    setIsLoading(true);
    if (!actionCode || !continueUrl || !mode) {
      toast.error("Invalid or expired reset link.");
      router.push("/sign-in");
    } else {
      verifyPasswordResetCode(auth, actionCode).then((email) => {
        setEmail(email);
      });
      setIsLoading(false);
    }
  }, [actionCode, router, continueUrl, mode]);

  const handleResetPassword = async () => {
    const password = form.getValues().password;
    setIsLoading(true);

    if (!actionCode) {
      toast.error("Invalid or expired reset link.");
      router.push("/sign-in");
      return;
    }
    verifyPasswordResetCode(auth, actionCode).then(() => {
      const newPassword = password;
      confirmPasswordReset(auth, actionCode, newPassword)
        .then(() => {
          toast.success("Password reset successful! You can now log in.");
          router.push("/sign-in");
        })
        .catch((error) => {
          toast.error(error.message || "Failed to reset password.");
        })
        .catch((error) => {
          toast.error(error.message || "Invalid or Expired Reset Link.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  return (
    <>
      {isLoading && <Loader />}
      <section className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10 relative">
          <Link
            href="/sign-in"
            className="text-sm text-primary-100 absolute top-5"
          >
            return
          </Link>
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.png" width={32} height={32} alt="logo" />
            <h2 className="text-primary-100">Intervue</h2>
          </div>
          <h3>Reset Password</h3>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleResetPassword)}
              className="w-full space-y-6 mt-4 form"
            >
              <FormField
                control={form.control}
                name="password"
                label="New Password"
                type="password"
                placeholder="Enter Your New Password"
              />
              <FormDescription className="-mt-3 text-light-400">
                Reset your password for <span>{email || "loading..."}</span>
              </FormDescription>
              <Button className="btn" type="submit">
                Reset Password
              </Button>
            </form>
          </Form>
        </div>
      </section>
    </>
  );
};

export default ResetForm;
