"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function SearchBar() {
  const router = useRouter();

  function onSubmitSearch(e: FormEvent) {
    e.preventDefault();
    router.push("/search");
  }

  return (
    <div className="flex items-center">
      <form onSubmit={onSubmitSearch}>
        <input
          type="text"
          className="bg-secondarybg rounded px-2 py-1 outline-none "
        />
      </form>
    </div>
  );
}
