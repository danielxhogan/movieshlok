import styles from "@/styles/Home.module.css";
import Navbar from "@/components/Navbar";
import Searchbar from "@/components/Searchbar";

export default function HomePage() {
  return <div className={styles["wrapper"]}>
    <Navbar />

    <div className={styles["home-page"]}>
      <Searchbar />
      <h1>If you don&apos;t like movies then you can get out</h1>
    </div>
  </div>
}