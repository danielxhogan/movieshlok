import SignUp from "@/components/auth/SignUp";
import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";

export default function SignUpPage() {
  const isSignedIn = !!auth().sessionId;
  const afterSignUpUrl = cookies().get("afterAuthUrl")?.value ?? "/";

  return <SignUp isSignedIn={isSignedIn} afterSignUpUrl={afterSignUpUrl} />;
}
