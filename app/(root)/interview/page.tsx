import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import React from "react";

const page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <h3 className="-mt-4">Create Your AI-Powered Interview</h3>
      <p className="-mt-10">
        Hi {user?.name}, customize your interview by selecting the criteria that
        matter to you. Our AI will generate questions tailored to your needs.
      </p>
      <Agent
        userName={user?.name as string}
        userId={user?.id}
        type="generate"
      />
    </>
  );
};

export default page;
