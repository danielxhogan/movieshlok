import styles from "@/styles/u/ListsPage.module.css"
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

export default function ListsPage() {
  return <div className="wrapper">
    <Navbar />

    <div className="content">
      <ProfileNav />

      <h1>Lists Page</h1>
    </div>

    <Footer />
  </div>
}