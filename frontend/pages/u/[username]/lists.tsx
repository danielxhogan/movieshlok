import styles from "@/styles/u/ListsPage.module.css"
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getLists, List, GetListsRequest } from "@/redux/actions/lists";
import { selectLists } from "@/redux/reducers/lists";

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import { Spinner } from "@chakra-ui/react";

export default function ListsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const lists = useAppSelector(selectLists);

  useEffect(() => {
    if (typeof router.query.username === "string") {
      const getListsRequest: GetListsRequest = {
        username: router.query.username
      }

      dispatch(getLists(getListsRequest));
    }
  }, [dispatch, router.query.username]);

  function makeList(list: List) {
    if (list.watchlist) { return; }
    return <Link href={`/u/${router.query.username}/list/${list.id}?name=${list.name}`}>
      <div className={styles["list"]}>
        { list.name }
      </div>
    </Link>
  }

  return <div className="wrapper">
    <Navbar />

    <div className="content">
      <ProfileNav />

      <h1 className="page-title">
        <span className="username">{ router.query.username }&apos;s</span> Lists
      </h1>

      { lists.status === "fulfilled" ?
      <>
        { lists.lists && lists.lists.map(list => makeList(list)) }
      </> : <>
        <div className="spinner">
          <Spinner size='xl' />
        </div>
      </>
      }
    </div>

    <Footer />
  </div>
}