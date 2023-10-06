import SignIn from "@/components/auth/SignIn";
import { auth } from "@clerk/nextjs";
import { cookies } from "next/headers";

export default function SignInPage() {
  const user = auth();
  const isSignedIn = !!user.sessionId;

  const returnPath = cookies().get("pathBeforeLogin")?.value || "/";

  return <SignIn returnPath={returnPath} isSignedIn={isSignedIn} />;
}
