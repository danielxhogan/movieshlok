import Theme from "./Theme";
import Header from "@/components/layout/header/Header";
import api from "@/api/server";
import { type UserType } from "@/server/routers/user";

import { auth } from "@clerk/nextjs";
import { type NextFont } from "next/dist/compiled/@next/font";

export default async function Body({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: NextFont;
}) {
  const { userId } = auth();
  let user: UserType | null = null;

  if (userId) {
    try {
      user = await api.user.getUser({ clerkId: userId });
    } catch (err: any) {
      console.log(`error calling user.getUser:::{ ${err} }`);
    }
  }

  return (
    <body
      className={`${inter.className} bg-secondarybg text-primaryfg relative min-h-screen pb-32 md:pb-20`}
    >
      <Theme>
        <Header user={user} />
        <div className="pt-28">{children}</div>
        <Footer />
      </Theme>
    </body>
  );
}

function Footer() {
  return (
    <footer className="bg-primarybg border-t-shadow absolute bottom-0 flex h-32 w-full flex-col justify-around border-t p-5 md:h-20">
      <h2 className="font-Audiowide text-2xl">
        If you don&apos;t like movies then you can get out
      </h2>
      <p className="text-end">
        This product uses the TMDB API but is not endorsed or certified by TMDB
      </p>
    </footer>
  );
}
