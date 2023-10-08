"use client";

import Logo from "./Logo";
import { SearchBar, SearchBarDrawer } from "./searchbars";
import ThemeSwitcher from "./ThemeSwtcher";
import User from "./User";

import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [shown, setShown] = useState(false);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const flag = useRef<boolean>(false);

  useEffect(() => {
    if (!flag.current) {
      flag.current = true;

      function closeSearchBarDrawer(event: MouseEvent) {
        if (
          !searchFormRef.current?.contains(event.target as Node) &&
          !searchToggleRef.current?.contains(event.target as Node)
        ) {
          setShown(false);
        }
      }

      document.addEventListener("click", closeSearchBarDrawer);
    }
  });

  return (
    <header className="absolute w-full">
      <div className="bg-primarybg shadow-shadow relative z-10 flex w-full justify-between px-5 py-3 shadow-lg">
        <Logo />
        <SearchBar
          shown={shown}
          setShown={setShown}
          searchToggleRef={searchToggleRef}
        />

        <div className="flex gap-3">
          <ThemeSwitcher />
          <User />
        </div>
      </div>

      <SearchBarDrawer shown={shown} searchFormRef={searchFormRef} />
    </header>
  );
}
