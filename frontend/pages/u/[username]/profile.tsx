import styles from "@/styles/u/ProfilePage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  return <div className="wrapper">
    <Navbar />

    <div className="content">
    <ProfileNav />

    </div>

    <Footer />
  </div>
}