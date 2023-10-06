"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInClient({
  isSignedIn,
  afterSignUpUrl,
}: {
  isSignedIn: boolean;
  afterSignUpUrl: string;
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
        <SignUp afterSignUpUrl={afterSignUpUrl} />
      ) : (
        <h1>Already Signed In</h1>
      )}
    </main>
  );
}
