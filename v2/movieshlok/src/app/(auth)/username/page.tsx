"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UsernamePage() {
  const router = useRouter();

  useEffect(() => {
    const refresh = localStorage.getItem("newUserRefresh");

    if (refresh === "false") {
      setTimeout(() => {
        localStorage.setItem("newUserRefresh", "true");
        router.refresh();
      }, 2000);
    }
  });

  return (
    <main>
      <form>
        <label>
          <input />
          choose a username
        </label>
      </form>
    </main>
  );
}
