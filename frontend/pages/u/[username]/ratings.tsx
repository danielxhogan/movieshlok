import styles from "@/styles/u/ReviewsPage.module.css";
import Navbar from "@/components/Navbar"

export default function ReviewsPage() {
  return <div className="wrapper">
    <Navbar />

    <div className={styles["movies-page"]}>
      <h1>Reviews Page</h1>
    </div>
  </div>
}