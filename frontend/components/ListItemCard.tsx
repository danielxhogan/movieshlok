import styles from "@/styles/u/ListItemCard.module.css";
import { ListItem } from "@/redux/actions/lists";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
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

type Props = {
  listItem: ListItem;
};

export default function ListItemCard(props: Props) {
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
    <div className={styles["wrapper"]}>
      <Link href={`/details/movie/${props.listItem.movie_id}`}>
        <div className={styles["flex-container"]}>
          <Image
            src={`${TMDB_IMAGE_URL}/w342${props.listItem.poster_path}`}
            className={styles["movie-poster"]}
            width={200}
            height={500}
            alt="backdrop"
          ></Image>
          <p className={styles["movie-title"]}>{props.listItem.movie_title}</p>
        </div>
      </Link>
      {credentials.username === router.query.username && (
        // @ts-ignore
        <Tooltip label={"delete movie"} placement="top">
          <i
            className={`${styles["delete-item"]} fa-solid fa-trash fa-md`}
            onClick={() => onClickDeleteListItem()}
          />
        </Tooltip>
      )}
    </div>
  );
}
