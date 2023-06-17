import styles from "@/styles/components/Footer.module.css";

interface Props {
  singlePage: boolean;
}

export function Footer({singlePage}: Props) {
  let singlePageClass: string;

  switch(singlePage) {
    case true: singlePageClass = "single-page"; break;
    case false: singlePageClass = ""; break;
  }

  return <div className={`${styles["wrapper"]} ${styles[singlePageClass]}`}>
    <h2>If you don&apos;t like movies then you can get out</h2>
    <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </div>
}