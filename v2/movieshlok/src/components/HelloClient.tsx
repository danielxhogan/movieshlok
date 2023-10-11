"use client";

import { useBearStore } from "@/zustand/store";

export default function HelloClient() {
  const bears = useBearStore((state) => state.bears);

  return (
    <main>
      <p>{bears}</p>
    </main>
  );
}
