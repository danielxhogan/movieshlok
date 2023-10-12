"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UsernamePage() {
  const router = useRouter();

  useEffect(() => {
    const refresh = localStorage.getItem("refresh");

    if (refresh === "false") {
      setTimeout(() => {
        localStorage.setItem("refresh", "true");
        // router.refresh();
        window.location.reload();
      }, 500);
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
