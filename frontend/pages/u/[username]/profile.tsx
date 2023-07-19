import styles from "@/styles/u/ProfilePage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { getRatings, GetRatingsRequest } from "@/redux/actions/reviews";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const username = router.query.username;

    if (typeof username === "string") {
      const getRatingsRequest: GetRatingsRequest = {
        username,
        page: 1
      };

      dispatch<any>(getRatings(getRatingsRequest));
    }
  }, [dispatch, router.query.username]);

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        <ProfileNav />

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          Profile
        </h1>
      </div>

      <Footer />
    </div>
  );
}
