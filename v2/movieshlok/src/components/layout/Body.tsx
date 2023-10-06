import { useUser } from "@clerk/nextjs";
import Theme from "./Theme";
import Header from "@/components/layout/header/Header";
import { NextFont } from "next/dist/compiled/@next/font";

export default function Layout({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: NextFont;
}) {
  return (
    <body className={`${inter.className} bg-secondarybg relative min-h-screen`}>
      <Theme>
        <Header />
        {children}
        <Footer />
      </Theme>
    </body>
  );
}

function Footer() {
  return <footer className="absolute bottom-0">Footer</footer>;
}
