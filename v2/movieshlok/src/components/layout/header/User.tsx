"use client";

import { HamburgerIcon } from "@/components/icons";

import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
    return <UserDropdown />;
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
  const userDropdown = useRef<HTMLDivElement>(null);
  const hamburger = useRef<HTMLButtonElement>(null);

  let flag = false;
  useEffect(() => {
    if (!flag) {
      flag = true;

      function closeUserDropdown(event: MouseEvent) {
        if (
          !userDropdown.current?.contains(event.target as Node) &&
          !hamburger.current?.contains(event.target as Node)
        ) {
          setShown(false);
        }
      }

      document.addEventListener("click", closeUserDropdown);
    }
  }, []);

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <button ref={hamburger} onClick={() => setShown(!shown)}>
          <HamburgerIcon />
        </button>

        <div
          ref={userDropdown}
          className={`${!shown && "top-8 opacity-0 transition-all"} ${
            shown && "top-10 opacity-100 transition-all"
          } bg-primarybg border-shadow absolute right-0 rounded border p-3 transition`}
        >
          <nav>
            <ul className="font-Audiowide w-36 text-right text-lg">
              <li>Profile</li>
              <li>Ratings</li>
              <li>Watchlist</li>
              <li>Lists</li>
              <li>Videos</li>
              <li>Movie Nights</li>

              <hr className="my-2" />

              <li>Account</li>
              <li>
                <SignOutButton />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
