import styles from "@/styles/u/WatchlistPage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import ListItemCard from "@/components/ListItemCard";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { getWatchlist, GetWatchlistRequest } from "@/redux/actions/lists";
import { selectWatchlist } from "@/redux/reducers/lists";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Spinner } from "@chakra-ui/react";

export default function WatchlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const watchlist = useAppSelector(selectWatchlist);

  useEffect(() => {
    if (typeof router.query.username === "string") {
      const watchlistRequest: GetWatchlistRequest = {
        username: router.query.username,
        page: 1
      };

      dispatch<any>(getWatchlist(watchlistRequest));
    }
  }, [dispatch, router.query.username]);

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        <ProfileNav />

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          Watchlist
        </h1>

        {watchlist.status === "fulfilled" ? (
          <span className="list-item-cards">
            {watchlist.list_items?.map(listItem => {
              return <ListItemCard listItem={listItem} key={listItem.id} />;
            })}

            {watchlist.list_items?.length === 0 && (
              <div className={styles["no-movies"]}>
                No movies in this watchlist yet
              </div>
            )}
          </span>
        ) : (
          <div className="spinner">
            {/* @ts-ignore */}
            <Spinner size="xl" />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
