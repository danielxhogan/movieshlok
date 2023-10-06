"use client";

import { MoonIcon, SunIcon, MonitorIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div></div>;
  }

  if (!theme) {
    return <div></div>;
  }

  return (
    <div className="flex items-center">
      <div className="bg-secondarybg flex h-8 w-20 justify-center rounded-xl">
        <button onClick={() => setTheme("dark")} className="text-primaryfg">
          <MoonIcon selected={theme === "dark"} theme={theme} />
        </button>

        <button onClick={() => setTheme("light")}>
          <SunIcon selected={theme === "light"} theme={theme} />
        </button>

        <button onClick={() => setTheme("system")}>
          <MonitorIcon selected={theme === "system"} theme={theme} />
        </button>
      </div>
    </div>
  );
}
