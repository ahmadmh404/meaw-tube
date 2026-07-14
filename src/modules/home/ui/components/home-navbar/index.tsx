import Image from "next/image";
import Link from "next/link";

import { AuthButton } from "@/modules/auth/components/auth-button";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchInput } from "./search-input";

export function HomeNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center shrink-0">
          {/* Menu & Logo */}
          <SidebarTrigger />
          <div className="p-4 flex items-center gap-1">
            <Link href={"/"}>
              <Image
                src={"/assets/logo.svg"}
                width={32}
                height={32}
                alt="Logo"
              />
            </Link>
            <p className="text-xl font-semibold tracking-tight">MeawTube</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-2 flex justify-center max-w-[700px] mx-auto">
          <SearchInput />
        </div>

        {/* Auth Button */}
        <div className="flex shrink-0 items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
