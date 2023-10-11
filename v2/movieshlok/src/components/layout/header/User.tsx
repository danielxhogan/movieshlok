"use client";

import { ChevronDownIcon } from "@/components/icons";
import { type UserType } from "@/server/routers/user";

import { SignOutButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function User({ user }: { user: UserType | null }) {
  const router = useRouter();
  const pathname = usePathname();

  function onClickSignIn() {
    if (pathname !== "/sign-in" && pathname !== "/sign-up") {
      document.cookie = `afterAuthUrl=${pathname}`;
      router.push("/sign-in");
    }
  }

  if (user) {
    return <UserDropdown user={user} />;
  } else {
    return (
      <div className="flex items-center">
        <button
          onClick={onClickSignIn}
          className="hover:bg-shadow hover:text-invertedfg font-Audiowide rounded p-1 transition"
        >
          Sign In
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
    <div className="flex items-center">
      <div className="relative flex">
        <button
          ref={menuButton}
          onClick={() => setShown(!shown)}
          className="flex"
        >
          <Image
            src={user?.imageUrl ?? ""}
            alt={`${user?.username}'s profile image`}
            width={40}
            height={40}
            className="z-10 rounded-full"
          />

          <div className="bg-secondarybg font-Audiowide -ml-2 flex self-center rounded p-1 pl-3">
            {user?.fullName}
            <span className={`flex items-center ${shown && "rotate-180"}`}>
              <ChevronDownIcon />
            </span>
          </div>
        </button>

        <div
          className={`${!shown && "top-10 opacity-0 transition-all"} ${
            shown && "top-12 opacity-100 transition-all"
          } bg-primarybg border-shadow absolute right-0 rounded border p-3 transition`}
        >
          <nav>
            <ul className="font-Audiowide w-36 text-right ">
              <NavLink label="Profile" href={`/u/${user?.fullName}`} />
              <NavLink label="Ratings" href={`/u/${user?.fullName}/ratings`} />
              <NavLink
                label="Watchlist"
                href={`/u/${user?.fullName}/watchlist`}
              />
              <NavLink label="Lists" href={`/u/${user?.fullName}/lists`} />
              <NavLink label="Videos" href={`/u/${user?.fullName}/videos`} />

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
