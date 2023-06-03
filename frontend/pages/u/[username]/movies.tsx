import styles from "@/styles/u/MoviesPage.module.css";
import Navbar from "@/components/Navbar"
import Searchbar from "@/components/Searchbar";

export default function MoviesPage() {
  return <div className={styles["wrapper"]}>
    <Navbar />

    <div className={styles["movies-page"]}>
      <Searchbar />

      <h1>Movies Page</h1>
    </div>
  </div>
}