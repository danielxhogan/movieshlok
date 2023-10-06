"use client";

import { useUser, SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInClient({ returnPath }: { returnPath: string }) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.back();
    }
  }, []);

  return (
    <main className="flex items-center justify-center py-20">
      {isSignedIn ? (
        <SignUp afterSignUpUrl={returnPath} />
      ) : (
        <h1>Already Signed In</h1>
      )}
    </main>
  );
}
