import styles from "@/styles/u/ListsPage.module.css"
import Navbar from "@/components/Navbar";
import Searchbar from "@/components/Searchbar";

export default function ListsPage() {
  return <div className={styles["wrapper"]}>
    <Navbar />

    <div className={styles["lists-page"]}>
      <Searchbar />

      <h1>Lists Page</h1>
    </div>
  </div>
}