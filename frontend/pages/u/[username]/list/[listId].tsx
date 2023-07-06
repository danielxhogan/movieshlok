import styles from "@/styles/u/ListPage.module.css"
import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import ListItemCard from "@/components/ListItemCard";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getListItems, GetListItemsRequest } from "@/redux/actions/lists";
import { selectListItems } from "@/redux/reducers/lists";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { Spinner } from "@chakra-ui/react";

export default function ListPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const listItems = useAppSelector(selectListItems);

  useEffect(() => {
    if (typeof router.query.listId === "string") {
      const listItemsRequest: GetListItemsRequest = {
        list_id: router.query.listId,
        page: 1
      };

      dispatch(getListItems(listItemsRequest));
    }
  }, [dispatch, router.query.listId]);

  return <div className="wrapper">
    <Navbar />

    <div className="content">
      <ProfileNav />

      <h1 className="page-title">
        <span className="username">{ router.query.username }&apos;s</span> List: <strong>{router.query.name}</strong>
      </h1>

      { listItems.status === "fulfilled" ?
      <div className="list-item-cards">
        { listItems.list_items &&
          listItems.list_items.map(listItem => {
            return <ListItemCard listItem={listItem} key={listItem.id} />
          })
        }
      </div> : <>
        <div className="spinner">
          <Spinner size='xl' />
        </div>
      </>
      }

    </div>

    <Footer />
  </div>
}