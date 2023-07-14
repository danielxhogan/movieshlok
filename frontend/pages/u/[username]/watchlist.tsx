import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import List, { ListType } from "@/components/List";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { getWatchlist, GetWatchlistRequest } from "@/redux/actions/lists";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function WatchlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      typeof router.query.username === "string" &&
      typeof router.query.page === "string"
    ) {
      const watchlistRequest: GetWatchlistRequest = {
        username: router.query.username,
        page: parseInt(router.query.page)
      };

      dispatch<any>(getWatchlist(watchlistRequest));
    }
  }, [dispatch, router.query]);

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        <ProfileNav />

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          Watchlist
        </h1>

        <List listType={ListType.WATCHLIST} />
      </div>

      <Footer />
    </div>
  );
}
