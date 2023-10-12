"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpClient({ isSignedIn }: { isSignedIn: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.back();
    }
  }, [isSignedIn, router]);

  return (
    <main className="flex items-center justify-center py-20">
      {!isSignedIn ? (
        <SignUp afterSignUpUrl="/username" signInUrl="/sign-in" />
      ) : (
        <h1>Already Signed In</h1>
      )}
    </main>
  );
}
