"use client";

import { useSearchStore } from "@/zustand/search";
import { MagnifyingGlassIcon } from "@/components/icons";

import type { FormEventHandler, RefObject } from "react";

export function SearchBar({
  onSubmitSearchForm,
  searchToggleRef,
}: {
  onSubmitSearchForm: FormEventHandler<HTMLFormElement>;
  searchToggleRef: RefObject<HTMLButtonElement>;
}) {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const shown = useSearchStore((state) => state.shown);
  const toggleShown = useSearchStore((state) => state.toggleShown);

  return (
    <>
      <form
        onSubmit={(e) => onSubmitSearchForm(e)}
        className="hidden lg:flex lg:items-center"
      >
        <div className="relative">
          <div className="text-secondaryfg absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondarybg focus:border-shadow rounded py-1 pl-10 pr-2 outline-none focus:border"
          />
        </div>
      </form>

      <button
        ref={searchToggleRef}
        onClick={() => toggleShown(shown)}
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
  onSubmitSearchForm,
  searchFormRef,
}: {
  onSubmitSearchForm: FormEventHandler<HTMLFormElement>;
  searchFormRef: RefObject<HTMLFormElement>;
}) {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const shown = useSearchStore((state) => state.shown);

  return (
    <div
      className={`bg-primarybg border-b-shadow absolute left-0 h-full w-full border-b transition-all lg:hidden ${
        shown ? "top-20" : "top-0"
      } `}
    >
      <div className="flex h-full w-full items-end justify-center pb-4">
        <form ref={searchFormRef} onSubmit={(e) => onSubmitSearchForm(e)}>
          <div className="relative">
            <div className="text-secondaryfg absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon />
            </div>

            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondarybg focus:border-shadow rounded py-1 pl-10 pr-2 outline-none focus:border"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
