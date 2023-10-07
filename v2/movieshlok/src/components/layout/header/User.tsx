"use client";

import { HamburgerIcon } from "@/components/icons";

import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function User() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  let pathname = usePathname();

  function onClickSignIn() {
    if (pathname !== "/sign-in" && pathname !== "/sign-up") {
      document.cookie = `afterAuthUrl=${pathname}`;
      router.push("/sign-in");
    }
  }

  if (isSignedIn) {
    return (
      // <div>
      //   <SignOutButton />
      //   <Link href="/account">Account</Link>
      // </div>
      <UserDropdown />
    );
  } else {
    return (
      <div className="flex items-center">
        <button
          onClick={onClickSignIn}
          className=" hover:bg-shadow hover:text-invertedfg rounded p-1 transition"
        >
          Sign In
        </button>
      </div>
    );
  }
}

function UserDropdown() {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative flex items-center">
      <button onClick={() => setShown(!shown)} className="relative">
        <HamburgerIcon />
        <div
          className={`${!shown && "top-8 opacity-0 transition-all"} ${
            shown && "top-10 opacity-100 transition-all"
          } bg-primarybg border-shadow absolute right-0 rounded border p-3 transition`}
        >
          <ul className="font-Audiowide text-right text-lg">
            <li>Profile</li>
            <li>Ratings</li>
            <li>Watchlist</li>
            <li>Lists</li>
            <li>Videos</li>

            <hr className="my-2" />

            <li>Account</li>
            <li>Logout</li>
          </ul>
        </div>
      </button>
    </div>
  );
}
