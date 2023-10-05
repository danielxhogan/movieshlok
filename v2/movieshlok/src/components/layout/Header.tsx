import Link from "next/link";
import ThemeSwitcher from "./ThemeSwtcher";

export default function Header() {
  return (
    <header className="bg-background bg-secondarybg  shadow-xl">
      <div className="container mx-auto flex justify-between px-5 py-3">
        <div>Logo</div>
        <div>Search</div>
        <div>
          <ThemeSwitcher />
          <Link href="/">Home</Link>
          <Link href="/test">Test</Link>
        </div>
      </div>
    </header>
  );
}
