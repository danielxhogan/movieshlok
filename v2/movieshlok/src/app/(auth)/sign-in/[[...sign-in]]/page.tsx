import SignIn from "@/components/auth/SignIn";
import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";

export default function SignInPage() {
  const isSignedIn = !!auth().sessionId;
  const afterSignInUrl = cookies().get("afterSignInUrl")?.value ?? "/";

  return <SignIn isSignedIn={isSignedIn} afterSignInUrl={afterSignInUrl} />;
}
