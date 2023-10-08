"use client";

import { useBearStore } from "@/zustand/store";

import { api } from "@/api/client";

export default function HelloClient() {
  const { data } = api.example.hello.useQuery({ text: "from the client" });
  const bears = useBearStore((state) => state.bears);

  return (
    <main>
      <p className="text-primaryfg">{data?.greeting}</p>
      <p>{bears}</p>
    </main>
  );
}
