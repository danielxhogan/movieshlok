import Logo from "./Logo";
import SearchBar from "./SearchBar";
import ThemeSwitcher from "./ThemeSwtcher";
import User from "./User";

export default function Header() {
  return (
    <header className="bg-primarybg  shadow-shadow flex justify-between px-5 py-3 shadow-lg">
      <Logo />
      <SearchBar />

      <div className="flex gap-3">
        <ThemeSwitcher />
        <User />
      </div>
    </header>
  );
}
