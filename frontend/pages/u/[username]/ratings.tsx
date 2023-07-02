import styles from "@/styles/u/ReviewsPage.module.css";
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getRatings, GetRatingsRequest } from "@/redux/actions/reviews";
import { selectRatings } from "@/redux/reducers/reviews";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ReviewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const ratings = useAppSelector(selectRatings);

  useEffect(() => {
    const username = router.query.username;

    if (typeof username === "string") {
      const getRatingsRequest: GetRatingsRequest = {
        username,
        page: 1
      }

      dispatch(getRatings(getRatingsRequest));
    }
  }, [dispatch, router.query.username]);


  return <div className="wrapper">
    <Navbar />

    <div className="content">
      <h1>Reviews Page</h1>
    </div>

    <Footer />
  </div>
}