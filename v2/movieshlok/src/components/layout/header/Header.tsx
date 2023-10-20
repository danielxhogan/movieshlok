"use client";

import Logo from "./Logo";
import { SearchBar, SearchBarDrawer } from "./searchbars";
import ThemeSwitcher from "./ThemeSwtcher";
import User from "./User";

import { useSearchStore } from "@/zustand/search";
import { type UserType } from "@/server/routers/user";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type FormEvent } from "react";

export default function Header({ user }: { user: UserType | null }) {
  const router = useRouter();

  const filter = useSearchStore((state) => state.filter);
  const setShown = useSearchStore((state) => state.setShown);
  const setSearchHeading = useSearchStore((state) => state.setSearchHeading);
  const searchQuery = useSearchStore((state) => state.searchQuery);

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

  function onSubmitSearchForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearchHeading(searchQuery);
    setShown(false);

    if (searchQuery) {
      router.push(`/search/${searchQuery}/${filter}`);
    }
  }

  return (
    <header className="absolute w-full">
      <div className="fixed w-full">
        <div className="bg-primarybg shadow-shadow relative z-10 flex w-full justify-between px-5 py-3 shadow-lg">
          <Logo />

          <SearchBar
            onSubmitSearchForm={onSubmitSearchForm}
            searchToggleRef={searchToggleRef}
          />

          <div className="flex gap-3">
            <ThemeSwitcher />
            <User user={user} />
          </div>
        </div>

        <SearchBarDrawer
          onSubmitSearchForm={onSubmitSearchForm}
          searchFormRef={searchFormRef}
        />
      </div>
    </header>
  );
}
