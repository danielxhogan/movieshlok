import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import List, { ListType } from "@/components/List";
import Footer from "@/components/Footer";

import { useDispatch } from "react-redux";
import { getListItems, GetListItemsRequest } from "@/redux/actions/lists";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ListPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof router.query.listId === "string") {
      const listItemsRequest: GetListItemsRequest = {
        list_id: router.query.listId,
        page: 1
      };

      dispatch<any>(getListItems(listItemsRequest));
    }
  }, [dispatch, router.query.listId]);

  return (
    <div className="wrapper">
      <Navbar />

      <div className="content">
        <ProfileNav />

        <h1 className="page-title">
          <span className="username">{router.query.username}&apos;s</span> List:{" "}
          <strong>{router.query.name}</strong>
        </h1>

        <List listType={ListType.OTHER_LIST} />
      </div>

      <Footer />
    </div>
  );
}
