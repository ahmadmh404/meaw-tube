"use client";

import { Button } from "@/components/ui/button";
import { UserButton, useAuth, SignInButton } from "@clerk/nextjs";

import { UserCircleIcon } from "lucide-react";

export function AuthButton() {
  const { isSignedIn } = useAuth();

  return (
    <>
      {!isSignedIn && (
        <SignInButton mode="modal">
          <Button
            variant={"outline"}
            className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
          >
            <UserCircleIcon className="" />
            Sign In
          </Button>
        </SignInButton>
      )}

      {/* TODO: ADd Menu Items for Studio and user profile */}
      {isSignedIn && <UserButton />}
    </>
  );
}
