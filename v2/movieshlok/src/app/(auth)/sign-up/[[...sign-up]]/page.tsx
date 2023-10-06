import SignUp from "@/components/auth/SignUp";
import { cookies } from "next/headers";

export default function SignUpPage() {
  const returnPath = cookies().get("path")?.value || "/";

  return <SignUp returnPath={returnPath} />;
}
