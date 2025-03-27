"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LogoutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast.success("Logged out successfully.");
      router.push("/sign-in");
    } catch (error) {
      toast.error(`Failed to log out. ${error}`);
    }
  };

  return (
    <button onClick={handleSignOut} className="btn-signout">
      Sign Out
    </button>
  );
};

export default LogoutButton;
