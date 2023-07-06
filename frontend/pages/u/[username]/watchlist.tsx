import styles from "@/styles/u/WatchlistPage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import ListItemCard from "@/components/ListItemCard";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getWatchlist, GetWatchlistRequest, ListItem } from "@/redux/actions/lists";
import { selectWatchlist } from "@/redux/reducers/lists";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Spinner } from "@chakra-ui/react";

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

      <h1 className="page-title">
        <span className="username">{ router.query.username }&apos;s</span> Watchlist
      </h1>

      { watchlist.status === "fulfilled" ?
      <span className="list-item-cards">
        { watchlist.list_items &&
          watchlist.list_items.map(listItem => {
            return <ListItemCard listItem={listItem} key={listItem.id} />
          })
        }
      </span> : <>
        <div className="spinner">
          <Spinner size='xl' />
        </div>
      </>
      }
    </div>
    <Footer />
  </div>
}