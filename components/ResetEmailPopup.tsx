"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import FormField from "@/components/FormField";
import Image from "next/image";
import { forgotPassword } from "@/lib/actions/auth.action";

const resetFormSchema = () => {
  return z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
  });
};

const ResetEmailPopup = ({
  setShowResetPassword,
}: {
  setShowResetPassword: (value: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = resetFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleResetLink = async () => {
    setIsLoading(true);
    try {
      const { email } = form.getValues();
      const result = await forgotPassword(email);

      if (!result?.success) {
        toast.error(result?.message);
        return;
      }

      toast.success(result?.message);
      setShowResetPassword(false);
    } catch (error) {
      toast.error(`Something went wrong ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <section className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10 relative">
          <p
            className="text-sm text-primary-100 absolute top-5 flex items-center cursor-pointer hover:text-primary-100/50"
            onClick={() => setShowResetPassword(false)}
          >
            return
          </p>
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.png" width={32} height={32} alt="logo" />
            <h2 className="text-primary-100">Intervue</h2>
          </div>
          <h3>Reset Password</h3>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleResetLink)}
              className="w-full space-y-6 mt-4 form"
            >
              <FormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter Your Email Address"
              />
              <FormDescription className="-mt-3 text-light-400">
                Enter email address to get password reset link
              </FormDescription>
              <Button className="btn" type="submit">
                Send Reset Link
              </Button>
            </form>
          </Form>
        </div>
      </section>
    </>
  );
};

export default ResetEmailPopup;
