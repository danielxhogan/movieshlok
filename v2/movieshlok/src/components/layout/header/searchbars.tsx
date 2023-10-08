"use client";

import { MagnifyingGlassIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import type { FormEvent, Dispatch, SetStateAction, RefObject } from "react";

export function SearchBar({
  shown,
  setShown,
  searchToggleRef,
}: {
  shown: boolean;
  setShown: Dispatch<SetStateAction<boolean>>;
  searchToggleRef: RefObject<HTMLButtonElement>;
}) {
  const router = useRouter();

  function onSubmitSearch(e: FormEvent) {
    e.preventDefault();
    router.push("/search");
  }

  return (
    <>
      <form
        onSubmit={onSubmitSearch}
        className="hidden lg:flex lg:items-center"
      >
        <input
          type="text"
          className="bg-secondarybg rounded px-2 py-1 outline-none "
        />
      </form>

      <button
        ref={searchToggleRef}
        onClick={() => setShown(!shown)}
        className="flex items-center lg:hidden"
      >
        <MagnifyingGlassIcon />
      </button>
    </>
  );
}

export function SearchBarDrawer({
  shown,
  searchFormRef,
}: {
  shown: boolean;
  searchFormRef: RefObject<HTMLFormElement>;
}) {
  return (
    <div
      className={`bg-primarybg absolute left-0 h-full w-full transition-all lg:hidden ${
        shown ? "top-20" : "top-0"
      } `}
    >
      <div className="flex h-full w-full items-end justify-center pb-4">
        <form ref={searchFormRef}>
          <input
            type="text"
            className="bg-secondarybg rounded px-2 py-1 outline-none "
          />
        </form>
      </div>
    </div>
  );
}
