"use client";

import { MagnifyingGlassIcon } from "@/components/icons";

import type {
  Dispatch,
  SetStateAction,
  FormEventHandler,
  RefObject,
} from "react";

export function SearchBar({
  searchQuery,
  setSearchQuery,
  onSubmitSearchForm,
  shown,
  setShown,
  searchToggleRef,
}: {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  onSubmitSearchForm: FormEventHandler<HTMLFormElement>;
  shown: boolean;
  setShown: Dispatch<SetStateAction<boolean>>;
  searchToggleRef: RefObject<HTMLButtonElement>;
}) {
  return (
    <>
      <form
        onSubmit={(e) => onSubmitSearchForm(e)}
        className="hidden lg:flex lg:items-center"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-secondarybg rounded px-2 py-1 outline-none "
        />
      </form>

      <button
        ref={searchToggleRef}
        onClick={() => setShown(!shown)}
        className="flex items-center lg:hidden"
      >
        <div className="hover:bg-shadow hover:text-invertedfg rounded p-1 transition-all">
          <MagnifyingGlassIcon />
        </div>
      </button>
    </>
  );
}

export function SearchBarDrawer({
  searchQuery,
  setSearchQuery,
  onSubmitSearchForm,
  shown,
  searchFormRef,
}: {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  onSubmitSearchForm: FormEventHandler<HTMLFormElement>;
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
        <form ref={searchFormRef} onSubmit={(e) => onSubmitSearchForm(e)}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondarybg rounded px-2 py-1 outline-none "
          />
        </form>
      </div>
    </div>
  );
}
