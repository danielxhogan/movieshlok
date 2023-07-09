import styles from "@/styles/u/ListsPage.module.css"
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { unsetCredentials } from "@/redux/reducers/auth";
import { selectCredentials } from "@/redux/reducers/auth";
import { getLists, createList, List, GetListsRequest, NewList } from "@/redux/actions/lists";
import { selectLists, selectNewList, addNewList, resetNewList } from "@/redux/reducers/lists";

import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FormControl, FormLabel, Input, useToast, Spinner } from "@chakra-ui/react";

export default function ListsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const lists = useAppSelector(selectLists);
  const newList = useAppSelector(selectNewList);

  const [ newListTitle, setNewListTitle ] = useState("");

  const toast = useToast();

  useEffect(() => {
    if (typeof router.query.username === "string") {
      const getListsRequest: GetListsRequest = {
        username: router.query.username
      }

      dispatch<any>(getLists(getListsRequest));
    }
  }, [dispatch, router.query.username]);

  function onSubmitNewList(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (credentials.jwt_token && credentials.username === router.query.username) {
      const newList: NewList = {
        jwt_token: credentials.jwt_token,
        name: newListTitle
      }

      dispatch<any>(createList(newList));
    }
  }

  // this useEffect detects when a new list is created
  // and updates the list of lists in the redux store
  useEffect(() => {
    if (newList.status === "fulfilled" &&
        newList.success === true &&
        newList.list
    ) {
      setNewListTitle("");
      dispatch(addNewList({ newList: newList.list }));
      dispatch(resetNewList());

    } else if (newList.status === "fulfilled" &&
        newList.code === 401
    ) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetNewList());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [newList, dispatch, toast]);

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

    { credentials.jwt_token && credentials.username === router.query.username &&
      <form onSubmit={onSubmitNewList} className={styles["new-list-form"]}>
        {/* @ts-ignore */}
        <FormControl>
          <FormLabel>
            <i className="fa-solid fa-plus"></i>
            <i> Add list</i>
          </FormLabel>
          <Input
            type="text"
            placeholder="Choose a name for your new list"
            value={newListTitle}
            onChange={e => setNewListTitle(e.target.value)}
            variant="filled"
          />
        </FormControl>
      </form>
    }

      { lists.status === "fulfilled" ?
      <>
        { lists.lists && lists.lists.length === 1 ?
          <div className={styles["no-lists"]}>Create you first list</div>
        :
          <i>View list</i>
        }

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