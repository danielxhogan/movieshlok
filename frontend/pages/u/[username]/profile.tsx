import styles from "@/styles/u/ProfilePage.module.css";
import Navbar from "@/components/Navbar";
import Searchbar from "@/components/Searchbar";

export default function ProfilePage() {
  return <div className={styles["wrapper"]}>
    <Navbar />

    <div className={styles["profile-page"]}>
      <Searchbar />
      <h1>Profile</h1>
    </div>
  </div>
}