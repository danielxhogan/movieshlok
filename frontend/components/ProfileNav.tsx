import styles from "@/styles/u/ProfileNav.module.css";

import { useRouter } from "next/router";
import Link from "next/link";

export default function ProfileNav() {
  const router = useRouter();

  return <div className={styles["wrapper"]}>
    <Link href={`/u/${router.query.username}/profile`}>
      <div>
        Profile
      </div>
    </Link>
    <Link href={`/u/${router.query.username}/ratings`}>
      <div>
        Ratings
      </div>
    </Link>
    <Link href={`/u/${router.query.username}/watchlist`}>
      <div>
        Watchlist
      </div>
    </Link>
    <Link href={`/u/${router.query.username}/lists`}>
      <div>
        Lists
      </div>
    </Link>
  </div>
}