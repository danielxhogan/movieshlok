"use client";

import { ChevronDownIcon } from "@/components/icons";
import { type UserType } from "@/server/routers/user";

import { SignOutButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { env } from "@/env.mjs";

const HOSTNAME = env.NEXT_PUBLIC_HOSTNAME;

export default function User({ user }: { user: UserType | null }) {
  const router = useRouter();
  const pathname = usePathname();

  function onClickSignInUp(endpoint: string) {
    let path = "";

    if (!pathname.includes("/sign-in") && !pathname.includes("/sign-up")) {
      path = endpoint
        .concat("?after_sign_up_url=")
        .concat(HOSTNAME)
        .concat("/username&after_sign_in_url=")
        .concat(HOSTNAME)
        .concat(pathname)
        .concat(window.location.search);

      localStorage.setItem("newUserRefresh", "false");
      localStorage.setItem(
        "afterSignUpUrl",
        `${pathname}${window.location.search}`,
      );
    } else {
      switch (endpoint) {
        case "/sign-in":
          path = window.location.href.replace("/sign-up", "/sign-in");
          break;
        case "/sign-up":
          path = window.location.href.replace("/sign-in", "/sign-up");
          break;
      }
    }

    router.push(path);
  }

  if (user) {
    return <UserDropdown user={user} />;
  } else {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onClickSignInUp("/sign-in")}
          className="hover:bg-shadow hover:text-invertedfg font-Audiowide rounded p-1 transition"
        >
          Sign In
        </button>

        <button
          onClick={() => onClickSignInUp("/sign-up")}
          className="hover:bg-shadow hover:text-invertedfg font-Audiowide border-shadow rounded border-2 p-1 transition"
        >
          Sign Up
        </button>
      </div>
    );
  }
}

function UserDropdown({ user }: { user: UserType }) {
  const [shown, setShown] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const flag = useRef<boolean>(false);

  useEffect(() => {
    if (!flag.current) {
      flag.current = true;

      function closeUserDropdown(event: MouseEvent) {
        if (!menuButton.current?.contains(event.target as Node)) {
          setShown(false);
        }
      }

      document.addEventListener("click", closeUserDropdown);
    }
  }, []);

  return (
    <div className="flex">
      <div className="relative flex">
        <button
          ref={menuButton}
          onClick={() => setShown(!shown)}
          className="flex items-center"
        >
          <Image
            src={user?.imageUrl ?? ""}
            alt={`${user?.username}'s profile image`}
            width={40}
            height={40}
            className="z-10 rounded-full"
          />

          <div className="hidden sm:block">
            <div className="bg-secondarybg font-Audiowide hover:bg-shadow hover:text-invertedfg -ml-2 flex self-center rounded p-1 pl-3 transition-all">
              {user?.username}
              <span className={`flex items-center ${shown && "rotate-180"}`}>
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </button>

        <div
          className={`${
            !shown && "invisible top-14 opacity-0 transition-all"
          } ${
            shown && "visible top-16 opacity-100 transition-all"
          } bg-primarybg border-shadow absolute right-0 rounded border p-3 transition`}
        >
          <nav className="z-10">
            <ul className="font-Audiowide w-36 text-right ">
              <NavLink label="Profile" href={`/u/${user?.username}`} />
              <NavLink label="Ratings" href={`/u/${user?.username}/ratings`} />
              <NavLink
                label="Watchlist"
                href={`/u/${user?.username}/watchlist`}
              />
              <NavLink label="Lists" href={`/u/${user?.username}/lists`} />
              <NavLink label="Videos" href={`/u/${user?.username}/videos`} />

              <hr className="border-shadow my-2" />

              <NavLink label="Movie Nights" href="/movie-nights" />
              <NavLink label="Account" href="/account" />
              <li className="hover:bg-secondarybg rounded p-1">
                <SignOutButton />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href}>
      <li className="hover:bg-secondarybg rounded p-1">{label}</li>
    </Link>
  );
}
