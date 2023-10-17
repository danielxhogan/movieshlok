import SignUp from "@/components/auth/SignUp";
import { auth } from "@clerk/nextjs";

export default function SignUpPage() {
  const isSignedIn = !!auth().sessionId;

  return <SignUp isSignedIn={isSignedIn} />;
}
