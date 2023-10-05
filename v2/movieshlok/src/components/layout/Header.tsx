import SearchBar from "./SearchBar";
import ThemeSwitcher from "./ThemeSwtcher";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-background bg-secondarybg  flex justify-between px-5 py-3 shadow-xl">
      {/* <div className="mx-auto flex justify-between px-5 py-3"> */}
      <div>
        <Image
          src="/logos/logo-transparent-light.png"
          alt="Movieshlok logo"
          width={300}
          height={50}
        ></Image>
      </div>

      <SearchBar />

      <div>
        <ThemeSwitcher />
        <Link href="/">Home</Link>
        <Link href="/search">Search</Link>
      </div>
      {/* </div> */}
    </header>
  );
}
