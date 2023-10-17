"use client";

import { useBearStore } from "@/zustand/store";

export default function Client() {
  const bears = useBearStore((state) => state.bears);
  const increasePopulation = useBearStore((state) => state.increasePopulation);

  return (
    <main>
      <p>{bears}</p>
      <button onClick={increasePopulation}>click</button>
    </main>
  );
}
