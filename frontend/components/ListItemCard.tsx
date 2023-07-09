import styles from "@/styles/u/ListItem.module.css";
import { ListItem } from "@/redux/actions/lists";

import Image from "next/image";
import Link from "next/link";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const TMDB_IMAGE_URL = publicRuntimeConfig.TMDB_IMAGE_URL;

type Props = {
  listItem: ListItem;
}

export default function ListItemCard(props: Props) {
  return <div className={styles["wrapper"]}>
    <Link href={`/details/movie/${props.listItem.movie_id}`}>
      <div className={styles["flex-container"]}>
        <Image
          src={`${TMDB_IMAGE_URL}/w342${props.listItem.poster_path}`}
          className={styles["movie-poster"]}
          width={200}
          height={500}
          alt="backdrop">
        </Image>
        <p className={styles["movie-title"]}>
          { props.listItem.movie_title }
        </p>
      </div>
    </Link>
  </div>
}