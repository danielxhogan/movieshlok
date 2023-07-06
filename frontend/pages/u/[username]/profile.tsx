import styles from "@/styles/u/ProfilePage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();

  return <div className="wrapper">
    <Navbar />

    <div className="content">
    <ProfileNav />

      <h1 className="page-title">
        <span className="username">{ router.query.username }&apos;s</span> Profile
      </h1>
    </div>

    <Footer />
  </div>
}