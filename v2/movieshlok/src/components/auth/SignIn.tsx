"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInClient({
  isSignedIn,
  afterSignInUrl,
}: {
  isSignedIn: boolean;
  afterSignInUrl: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.back();
    }
  }, [isSignedIn, router]);

  return (
    <main className="flex items-center justify-center py-20">
      {!isSignedIn ? (
        <SignIn afterSignInUrl={afterSignInUrl} signUpUrl="/sign-up" />
      ) : (
        <h1>Already Signed In</h1>
      )}
    </main>
  );
}
