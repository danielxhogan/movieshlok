"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export default function User() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  function onClickSignIn() {
    if (pathname !== "/sign-in" && pathname !== "/sign-up") {
      document.cookie = `pathBeforeLogin=${pathname}`;
      router.push("/sign-in");
    }
  }

  if (isSignedIn) {
    return <UserButton afterSignOutUrl={pathname} />;
  } else {
    return <button onClick={onClickSignIn}>Sign In</button>;
  }
}
