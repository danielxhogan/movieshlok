"use client";

import Header from "@/components/layout/header/Header";
import { ThemeProvider } from "next-themes";
import { type NextFont } from "next/dist/compiled/@next/font";

export default function Layout({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: NextFont;
}) {
  return (
    <body
      className={`${inter.className} bg-secondarybg text-primaryfg relative min-h-screen`}
    >
      <ThemeProvider attribute="class">
        <Header />
        <div className="pt-28">{children}</div>
        <Footer />
      </ThemeProvider>
    </body>
  );
}

function Footer() {
  return <footer className="absolute bottom-0">Footer</footer>;
}
