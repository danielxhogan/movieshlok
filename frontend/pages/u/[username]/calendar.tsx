import styles from "@/styles/u/CalendarPage.module.css";
import Navbar from "@/components/Navbar";
import Searchbar from "@/components/Searchbar";

export default function CalendarPage() {
  return <div className={styles["wrapper"]}>
    <Navbar />

    <div className={styles["calendar-page"]}>
      <Searchbar />

      <h1>Calendar Page</h1>
    </div>
  </div>
}