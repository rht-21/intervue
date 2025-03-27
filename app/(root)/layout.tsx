import LogoutButton from "@/components/ui/logout";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between w-full">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <h2 className="text-primary-100">Intervue</h2>
        </Link>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
};

export default RootLayout;
