import SignIn from "@/components/auth/SignIn";
import { auth } from "@clerk/nextjs";

export default function SignInPage() {
  const isSignedIn = !!auth().sessionId;

  return <SignIn isSignedIn={isSignedIn} />;
}
