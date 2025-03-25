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

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-in" ? z.string().optional() : z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
  });
};

const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`Something went wrong ${error}`);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <section className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" width={38} height={32} alt="logo" />
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

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>

            <p className="text-center">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
              <Link
                href={isSignIn ? "/sign-up" : "/sign-in"}
                className="font-medium text-user-primary ml-1"
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default AuthForm;
