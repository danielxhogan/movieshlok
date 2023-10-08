"use client";

import { ChevronDownIcon } from "@/components/icons";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
          className=" hover:bg-shadow hover:text-invertedfg font-Audiowide rounded p-1 transition"
        >
          Sign In
        </button>
      </div>
    );
  }
}

function UserDropdown() {
  const { user } = useUser();

  const [shown, setShown] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const userDropdown = useRef<HTMLDivElement>(null);

  let flag = false;
  useEffect(() => {
    if (!flag) {
      flag = true;

      function closeUserDropdown(event: MouseEvent) {
        if (
          !userDropdown.current?.contains(event.target as Node) &&
          !menuButton.current?.contains(event.target as Node)
        ) {
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
          ref={userDropdown}
          className={`${!shown && "top-10 opacity-0 transition-all"} ${
            shown && "top-12 opacity-100 transition-all"
          } bg-primarybg border-shadow absolute right-0 rounded border p-3 transition`}
        >
          <nav>
            <ul className="font-Audiowide w-36 text-right ">
              <NavLink linkName="Profile" linkHref={`/u/${user?.fullName}`} />

              <NavLink
                linkName="Ratings"
                linkHref={`/u/${user?.fullName}/ratings`}
              />

              <NavLink
                linkName="Watchlist"
                linkHref={`/u/${user?.fullName}/watchlist`}
              />

              <NavLink
                linkName="Lists"
                linkHref={`/u/${user?.fullName}/lists`}
              />

              <NavLink
                linkName="Videos"
                linkHref={`/u/${user?.fullName}/videos`}
              />

              <hr className="my-2" />

              <NavLink linkName="Movie Nights" linkHref="/movie-nights" />

              <NavLink linkName="Account" linkHref="/account" />

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

function NavLink({
  linkName,
  linkHref,
}: {
  linkName: string;
  linkHref: string;
}) {
  return (
    <Link href={linkHref}>
      <li className="hover:bg-secondarybg rounded p-1">{linkName}</li>
    </Link>
  );
}
