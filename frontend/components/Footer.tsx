import styles from "@/styles/components/Footer.module.css";

export default function Footer() {
  let singlePageClass: string;

  return (
    <div className={`${styles["wrapper"]}`}>
      <h2>If you don&apos;t like movies then you can get out</h2>
      <p>
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </div>
  );
}
