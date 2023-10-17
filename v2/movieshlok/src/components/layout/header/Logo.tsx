"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lightLogoSrc = "/logos/logo-transparent-light.png";
  const lightIconSrc = "/logos/logo-icon-transparent-light.png";

  const darkLogoSrc = "/logos/logo-transparent-dark.png";
  const darkIconSrc = "/logos/logo-icon-transparent-dark.png";

  function makeLogo(logoSrc: string, iconSrc: string) {
    return (
      <>
        <Link href="/" className="hidden md:block">
          <Image
            src={logoSrc}
            alt="Movieshlok logo"
            width={300}
            height={68}
            priority
          />
        </Link>
        <Link href="/" className="md:hidden">
          <Image
            src={iconSrc}
            alt="Movieshlok logo"
            width={68}
            height={68}
            priority
          />
        </Link>
      </>
    );
  }

  if (!mounted || resolvedTheme === "light") {
    return makeLogo(lightLogoSrc, lightIconSrc);
  } else {
    return makeLogo(darkLogoSrc, darkIconSrc);
  }
}
