import listStyles from "@/styles/components/List.module.css";
import listItemCardStyles from "@/styles/u/ListItemCard.module.css";
import Pagination, { UseCases } from "./Pagination";

import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { PersonCredit } from "@/redux/actions/tmdb";

import { useRouter } from "next/router";

// LIST IMPORTS
// ***********************************
import { selectWatchlist } from "@/redux/reducers/lists";
import { selectListItems } from "@/redux/reducers/lists";
import { ListItems } from "@/redux/reducers/lists";

import { Spinner } from "@chakra-ui/react";

export enum ListType {
  WATCHLIST,
  OTHER_LIST,
  CREDITS
}

type ListProps = {
  listType: ListType;
  personCredits?: PersonCredit[];
};

// LIST COMPONENT
// ***********************************
export default function List(props: ListProps) {
  const router = useRouter();
  const list = useAppSelector(selectListItems);
  const watchlist = useAppSelector(selectWatchlist);

  function makeListItemCards(listItems: ListItems) {
    return listItems.status === "fulfilled" ? (
      <span className="list-item-cards">
        {listItems.list_items?.map(listItem => {
          return (
            <ListItemCard
              cardType={CardType.LIST}
              listItem={listItem}
              key={listItem.id}
            />
          );
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

  function makeCreditCards() {
    if (props.personCredits) {
      return (
        <span className="list-item-cards">
          {props.personCredits.map(credit => {
            return (
              <ListItemCard
                cardType={CardType.CREDIT}
                credit={credit}
                key={credit.id}
              />
            );
          })}

          {props.personCredits.length === 0 && (
            <div className={listStyles["no-movies"]}>No movies found</div>
          )}
        </span>
      );
    }
  }

  return (
    <div>
      {props.listType === ListType.WATCHLIST && makeListItemCards(watchlist)}
      {props.listType === ListType.WATCHLIST &&
        watchlist.total_pages &&
        watchlist.total_pages > 1 &&
        typeof router.query.username === "string" && (
          <>
            <br />
            <br />
            <Pagination
              useCase={UseCases.WATCHLIST}
              currentPage={watchlist.page}
              totalPages={watchlist.total_pages}
              username={router.query.username}
            />
          </>
        )}

      {props.listType === ListType.OTHER_LIST && makeListItemCards(list)}
      {props.listType === ListType.OTHER_LIST &&
        list.total_pages &&
        list.total_pages > 1 &&
        typeof router.query.username === "string" &&
        typeof router.query.listId === "string" &&
        typeof router.query.name === "string" && (
          <>
            <br />
            <br />
            <Pagination
              useCase={UseCases.OTHER_LIST}
              currentPage={list.page}
              totalPages={list.total_pages}
              username={router.query.username}
              listId={router.query.listId}
              listName={router.query.name}
            />
          </>
        )}

      {props.personCredits && makeCreditCards()}
    </div>
  );
}

// LIST ITEM CARD IMPORTS
// ***********************************
import { selectCredentials, unsetCredentials } from "@/redux/reducers/auth";
import {
  deleteListItem,
  DeleteListItemRequest,
  ListItem
} from "@/redux/actions/lists";

import {
  selectDeletedListItem,
  removeListItem,
  removeWatchlistItem,
  resetDeletedListItem
} from "@/redux/reducers/lists";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Tooltip, useToast } from "@chakra-ui/react";

const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;

export enum CardType {
  LIST,
  CREDIT
}

interface PersonCreditProps {
  cardType: CardType.CREDIT;
  credit: PersonCredit;
}

interface ListItemProps {
  cardType: CardType.LIST;
  listItem: ListItem;
}

type ListItemCardProps = PersonCreditProps | ListItemProps;

// ListItemCard need:
// id of the list item (if rendering a list with the possibility to delete)
//

// LIST ITEM CARD COMPONENT
// ***********************************
export function ListItemCard(props: ListItemCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const credentials = useAppSelector(selectCredentials);
  const deletedListItem = useAppSelector(selectDeletedListItem);

  const toast = useToast();

  let movie_id;
  let movie_title;
  let poster_path;

  switch (props.cardType) {
    case CardType.LIST:
      movie_id = props.listItem.movie_id;
      movie_title = props.listItem.movie_title;
      poster_path = props.listItem.poster_path;
      break;

    case CardType.CREDIT:
      movie_id = props.credit.id;
      movie_title = props.credit.title;
      poster_path = props.credit.poster_path;
      break;
  }

  function onClickDeleteListItem() {
    if (props.cardType === CardType.LIST && credentials.jwt_token) {
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
      <Link href={`/details/movie/${movie_id}`}>
        <div className={listItemCardStyles["flex-container"]}>
          {poster_path && (
            <Image
              src={`${TMDB_IMAGE_URL}/w342${poster_path}`}
              className={listItemCardStyles["movie-poster"]}
              width={200}
              height={500}
              alt="backdrop"
            ></Image>
          )}
          <p className={listItemCardStyles["movie-title"]}>{movie_title}</p>
        </div>
      </Link>

      {props.cardType === CardType.LIST &&
        credentials.username === router.query.username && (
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
