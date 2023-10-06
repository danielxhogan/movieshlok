"use client";

import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function User() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  let pathname = usePathname();
  const [pathnameState, setPathname] = useState(pathname);

  useEffect(() => {
    console.log(`pathname:::::{ ${pathname} }`);
    setPathname(pathname);
  }, [pathname]);

  function onClickSignIn() {
    if (pathname !== "/sign-in" && pathname !== "/sign-up") {
      document.cookie = `afterAuthUrl=${pathname}`;
      router.push("/sign-in");
    }
  }

  if (isSignedIn) {
    // return <UserButton afterSignOutUrl={pathnameState} />;
    return (
      <div>
        <SignOutButton />
        <Link href="/account">Account</Link>
      </div>
    );
  } else {
    return <button onClick={onClickSignIn}>Sign In</button>;
  }
}
