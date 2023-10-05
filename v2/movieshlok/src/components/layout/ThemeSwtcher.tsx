"use client";

import { useEffect } from "react";

export default function ThemeSwitcher() {
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      document.cookie = "theme=dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.cookie = "theme=";
    }
  });

  function onClickDarkTheme() {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
    document.cookie = "theme=dark";
  }

  function onClickLightTheme() {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
    document.cookie = "theme=";
  }

  function onClickSystemTheme() {
    localStorage.removeItem("theme");

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
      document.cookie = "theme=dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.cookie = "theme=";
    }
  }

  return (
    <>
      <button onClick={onClickDarkTheme}>Dark</button>
      <button onClick={onClickLightTheme}>Light</button>
      <button onClick={onClickSystemTheme}>System</button>
    </>
  );
}
