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
  const darkLogoSrc = "/logos/logo-transparent-dark.png";

  function makeLogo(src: string) {
    return (
      <Link href="/">
        <Image
          src={src}
          alt="Movieshlok logo"
          width={300}
          height={50}
          priority
        />
      </Link>
    );
  }

  if (!mounted || resolvedTheme === "light") {
    return makeLogo(lightLogoSrc);
  } else {
    return makeLogo(darkLogoSrc);
  }
}
