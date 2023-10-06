"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInClient({
  returnPath,
  isSignedIn,
}: {
  returnPath: string;
  isSignedIn: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.back();
    }
  }, []);

  return (
    <main className="flex items-center justify-center py-20">
      {!isSignedIn ? (
        <SignIn afterSignInUrl={returnPath} />
      ) : (
        <h1>Already Signed In</h1>
      )}
    </main>
  );
}
