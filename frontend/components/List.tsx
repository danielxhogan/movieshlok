import listStyles from "@/styles/components/List.module.css";
import listItemCardStyles from "@/styles/u/ListItemCard.module.css";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";

// LIST IMPORTS
// ***********************************
import { ListItems } from "@/redux/reducers/lists";
import { selectWatchlist } from "@/redux/reducers/lists";
import { selectListItems } from "@/redux/reducers/lists";

import { Spinner } from "@chakra-ui/react";

export enum ListType {
  WATCHLIST,
  OTHER_LIST
}

type ListProps = {
  listType: ListType;
};

// LIST COMPONENT
// ***********************************
export default function List(props: ListProps) {
  const list = useAppSelector(selectListItems);
  const watchlist = useAppSelector(selectWatchlist);

  function makeCards(listItems: ListItems) {
    return listItems.status === "fulfilled" ? (
      <span className="list-item-cards">
        {listItems.list_items?.map(listItem => {
          return <ListItemCard listItem={listItem} key={listItem.id} />;
        })}

        {listItems.list_items?.length === 0 && (
          <div className={listStyles["no-movies"]}>
            No movies in this watchlist yet
          </div>
        )}
      </span>
    ) : (
      <div className="spinner">
        {/* @ts-ignore */}
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      {props.listType === ListType.WATCHLIST && makeCards(watchlist)}
      {props.listType === ListType.OTHER_LIST && makeCards(list)}
    </div>
  );
}

// LIST ITEM CARD IMPORTS
// ***********************************
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import { ListItem } from "@/redux/actions/lists";
import { deleteListItem, DeleteListItemRequest } from "@/redux/actions/lists";
import {
  selectDeletedListItem,
  removeListItem,
  removeWatchlistItem,
  resetDeletedListItem
} from "@/redux/reducers/lists";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import { Tooltip, useToast } from "@chakra-ui/react";

const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;

type ListItemCardProps = {
  listItem: ListItem;
};

// LIST ITEM CARD COMPONENT
// ***********************************
export function ListItemCard(props: ListItemCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const deletedListItem = useAppSelector(selectDeletedListItem);

  const toast = useToast();

  function onClickDeleteListItem() {
    if (credentials.jwt_token) {
      const deleteRequest: DeleteListItemRequest = {
        jwt_token: credentials.jwt_token,
        list_item_id: props.listItem.id
      };

      dispatch<any>(deleteListItem(deleteRequest));
    }
  }

  useEffect(() => {
    if (
      deletedListItem.status === "fulfilled" &&
      deletedListItem.success === true &&
      deletedListItem.list_item
    ) {
      dispatch(removeListItem({ list_item_id: deletedListItem.list_item.id }));

      dispatch(
        removeWatchlistItem({ list_item_id: deletedListItem.list_item.id })
      );

      dispatch(resetDeletedListItem());
    } else if (
      deletedListItem.status === "fulfilled" &&
      deletedListItem.code === 401
    ) {
      toast({
        title: "You need to log in again",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      dispatch(resetDeletedListItem());
      dispatch(unsetCredentials());
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("username");
    }
  }, [deletedListItem, dispatch, toast]);

  return (
    <div className={listItemCardStyles["wrapper"]}>
      <Link href={`/details/movie/${props.listItem.movie_id}`}>
        <div className={listItemCardStyles["flex-container"]}>
          <Image
            src={`${TMDB_IMAGE_URL}/w342${props.listItem.poster_path}`}
            className={listItemCardStyles["movie-poster"]}
            width={200}
            height={500}
            alt="backdrop"
          ></Image>
          <p className={listItemCardStyles["movie-title"]}>
            {props.listItem.movie_title}
          </p>
        </div>
      </Link>
      {credentials.username === router.query.username && (
        // @ts-ignore
        <Tooltip label={"delete movie"} placement="top">
          <i
            className={`${listItemCardStyles["delete-item"]} fa-solid fa-trash fa-md`}
            onClick={() => onClickDeleteListItem()}
          />
        </Tooltip>
      )}
    </div>
  );
}
