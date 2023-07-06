import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getWatchlist, GetWatchlistRequest } from "@/redux/actions/lists";
import { selectWatchlist } from "@/redux/reducers/lists";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function WatchlistPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const watchlist = useAppSelector(selectWatchlist);

  useEffect(() => {
    if (typeof router.query.username === "string") {
      const watchlistRequest: GetWatchlistRequest = {
        username: router.query.username,
        page: 1
      };

      dispatch(getWatchlist(watchlistRequest));
    }
  }, [dispatch, router.query.username])

  return <div className="wrapper">
    <Navbar />

    <div className="content">
      <ProfileNav />

      <h1>
        Watchlist Page
      </h1>
    </div>
    <Footer />
  </div>
}