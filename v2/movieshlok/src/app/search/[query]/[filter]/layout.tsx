"use client";

import { useSearchStore } from "@/zustand/search";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const searchHeading = useSearchStore((state) => state.searchHeading);
  const setSearchHeading = useSearchStore((state) => state.setSearchHeading);

  useEffect(() => {
    if (typeof params.query === "string") {
      setSearchHeading(params.query);
    }
  }, [params.query, setSearchHeading]);

  return (
    <div>
      <h1 className="text-shadow font-Audiowide border-b-shadow mb-5 border-b text-4xl">
        Results for: <strong>{decodeURI(searchHeading)}</strong>
      </h1>

      <div className="mt-10 flex flex-col px-4 sm:container sm:mx-auto sm:px-7 md:flex-row md:justify-center md:gap-6">
        <Filter />
        <div className="flex justify-center md:w-4/5 lg:w-2/3">{children}</div>
      </div>
    </div>
  );
}

function Filter() {
  return (
    <aside className="font-Audiowide border-shadow mb-5 h-fit rounded border p-4 md:sticky md:top-28 md:order-2">
      <p className="mb-2 text-sm underline">Show results for</p>
      <ul className="flex flex-row flex-wrap gap-4 md:flex-col md:justify-start md:gap-0">
        <FilterItem filter="movie">Movie</FilterItem>
        <FilterItem filter="person">Person</FilterItem>
      </ul>
    </aside>
  );
}

function FilterItem({
  children,
  filter,
}: {
  children: string;
  filter: string;
}) {
  const router = useRouter();
  const params = useParams();

  const searchQuery = useSearchStore((state) => state.searchQuery);
  const currentFilter = useSearchStore((state) => state.filter);
  const setSearchHeading = useSearchStore((state) => state.setSearchHeading);
  const setFilter = useSearchStore((state) => state.setFilter);
  const setShown = useSearchStore((state) => state.setShown);

  useEffect(() => {
    if (typeof params.filter === "string") {
      setFilter(params.filter);
    }
  }, [params.filter, setFilter]);

  function onSubmitSearch() {
    setSearchHeading(searchQuery);
    setFilter(filter);
    setShown(false);

    if (searchQuery) {
      router.push(`/search/${searchQuery}/${filter}`);
    }
  }

  return (
    <li
      className={`hover:bg-shadow rounded p-1 transition-all md:w-36 ${
        filter === currentFilter
          ? "text-primaryfg"
          : "text-secondaryfg hover:text-primarybg"
      }`}
    >
      <button onClick={onSubmitSearch} className="w-full text-left">
        {children}
      </button>
    </li>
  );
}
