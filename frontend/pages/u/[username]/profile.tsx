import styles from "@/styles/u/ProfilePage.module.css";
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Rating from "@/components/Rating";
import { ListItemCard, CardType } from "@/components/List";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { getRatings, GetRatingsRequest } from "@/redux/actions/reviews";
import { selectRatings } from "@/redux/reducers/reviews";
import { getWatchlist, GetWatchlistRequest } from "@/redux/actions/lists";
import { selectWatchlist } from "@/redux/reducers/lists";
import { getLists, GetListsRequest } from "@/redux/actions/lists";
import { selectLists } from "@/redux/reducers/lists";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import { Spinner } from "@chakra-ui/react";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const ratings = useAppSelector(selectRatings);
  const watchlist = useAppSelector(selectWatchlist);
  const lists = useAppSelector(selectLists);

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

  useEffect(() => {
    if (typeof router.query.username === "string") {
      const watchlistRequest: GetWatchlistRequest = {
        username: router.query.username,
        page: 1
      };

      dispatch<any>(getWatchlist(watchlistRequest));
    }
  }, [dispatch, router.query]);

  useEffect(() => {
    if (typeof router.query.username === "string") {
      const getListsRequest: GetListsRequest = {
        username: router.query.username
      };

      dispatch<any>(getLists(getListsRequest));
    }
  }, [dispatch, router.query.username]);

  function makeRatings() {
    const ratingElements: JSX.Element[] = [];

    for (let i = 0; i < 3; i++) {
      if (ratings.ratings && ratings.ratings[i]) {
        const date = new Date(ratings.ratings[i].timestamp * 1000);

        ratingElements.push(
          <Rating
            key={i}
            id={i}
            rating={ratings.ratings[i]}
            date={date.getDate()}
          />
        );
      }
    }

    return ratingElements;
  }

  function makeWatchlist() {
    const ratingElements: JSX.Element[] = [];

    for (let i = 0; i < 5; i++) {
      if (watchlist.list_items && watchlist.list_items[i]) {
        ratingElements.push(
          <ListItemCard
            cardType={CardType.LIST}
            listItem={watchlist.list_items[i]}
          />
        );
      }
    }

    return ratingElements;
  }

  function makeLists() {
    const listElements: JSX.Element[] = [];
    let i = -1;
    let count = 0;

    while (count < 3 && lists.lists) {
      i++;

      if (!lists.lists[i]) {
        break;
      }

      if (lists.lists[i].watchlist) {
        continue;
      }

      count++;
      const list = lists.lists[i];

      listElements.push(
        <div className={styles["list"]}>
          <Link
            href={`/u/${router.query.username}/list/${list.id}?name=${list.name}&page=1`}
            className={styles["list-name"]}
          >
            <div className={styles["list-name-text"]}>{list.name}</div>
          </Link>
        </div>
      );
    }

    return listElements;
  }

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        <ProfileNav />

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          Profile
        </h1>

        <h2 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          recent Ratings
        </h2>

        {ratings.status === "fulfilled" ? (
          <>{makeRatings()}</>
        ) : (
          <>
            <div className="spinner">
              {/* @ts-ignore */}
              <Spinner size="xl" />
            </div>
          </>
        )}

        <h2 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          recently added Watchlist items
        </h2>

        {watchlist.status === "fulfilled" ? (
          <span className="list-item-cards">{makeWatchlist()}</span>
        ) : (
          <>
            <div className="spinner">
              {/* @ts-ignore */}
              <Spinner size="xl" />
            </div>
          </>
        )}

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span>{" "}
          recently created Lists
        </h1>

        {lists.status === "fulfilled" ? (
          <>{makeLists()}</>
        ) : (
          <>
            <div className="spinner">
              {/* @ts-ignore */}
              <Spinner size="xl" />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
