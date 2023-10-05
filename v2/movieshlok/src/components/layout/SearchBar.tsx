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
    <div>
      <form>
        <input type="text" onSubmit={onSubmitSearch} />
      </form>
    </div>
  );
}
