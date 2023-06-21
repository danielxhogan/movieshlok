import styles from "@/styles/Home.module.css";
import Navbar from "@/components/Navbar";
import Searchbar from "@/components/Searchbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return <div className={styles["wrapper"]}>
    <Navbar />

    <div className={styles["home-page"]}>
      <Searchbar />
    </div>
    <Footer singlePage={true}/>
  </div>
}