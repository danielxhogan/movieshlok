import styles from "@/styles/components/Pagination.module.css";

// imports for SEARCH_RESULTS use case
import { FilterResults } from "@/pages/search";
import { useRouter } from "next/router";

// imports for REVIEWS use case
import { useDispatch } from "react-redux";
import { getReviews, GetReviewsRequest } from "@/redux/actions/reviews";

export enum UseCases {
  SEARCH_RESULTS,
  REVIEWS,
  RATINGS,
  WATCHLIST,
  OTHER_LIST
}

interface SearchResultsData {
  useCase: UseCases.SEARCH_RESULTS;
  currentPage: string;
  totalPages: string;
  searchQuery: string;
  filter: FilterResults;
}

interface ReviewsData {
  useCase: UseCases.REVIEWS;
  currentPage: number;
  totalPages: number;
  movieId: string;
}

interface RatingsData {
  useCase: UseCases.RATINGS;
  currentPage: number;
  totalPages: number;
  username: string;
}

interface WatchlistData {
  useCase: UseCases.WATCHLIST;
  currentPage: number;
  totalPages: number;
  username: string;
}

interface OtherListData {
  useCase: UseCases.OTHER_LIST;
  currentPage: number;
  totalPages: number;
  username: string;
  listId: string;
  listName: string;
}

type Props =
  | SearchResultsData
  | ReviewsData
  | RatingsData
  | WatchlistData
  | OtherListData;

export default function Pagination(props: Props) {
  const router = useRouter();
  const dispatch = useDispatch();

  function searchResultsOnClick(page: number) {
    if (props.useCase === UseCases.SEARCH_RESULTS) {
      router.push(
        `/search?query=${props.searchQuery}&filter=${props.filter}&page=${page}`
      );
    }
  }

  function reviewsOnClick(page: number) {
    if (props.useCase === UseCases.REVIEWS) {
      const getReviewsRequest: GetReviewsRequest = {
        page,
        movie_id: props.movieId
      };

      dispatch<any>(getReviews(getReviewsRequest));
    }
  }

  function ratingsOnClick(page: number) {
    if (props.useCase === UseCases.RATINGS) {
      router.push(`/u/${props.username}/ratings?page=${page}`);
    }
  }

  function watchlistOnClick(page: number) {
    if (props.useCase === UseCases.WATCHLIST) {
      router.push(`/u/${props.username}/watchlist?page=${page}`);
    }
  }

  function listOnClick(page: number) {
    if (props.useCase === UseCases.OTHER_LIST) {
      router.push(
        `/u/${props.username}/list/${props.listId}?name=${props.listName}&page=${page}`
      );
    }
  }

  function makeLinksArray(
    startI: number,
    endI: number,
    currentPage: number,
    onClickFuncion: Function
  ) {
    const linksArray = [];

    for (let i = startI; i < endI; i++) {
      const pageNumber = i + 1;

      linksArray.push(
        <span
          key={i}
          onClick={() => onClickFuncion(pageNumber)}
          className={
            i + 1 === currentPage
              ? `${styles["current-page"]} ${styles["page-button"]}`
              : `${styles["page-button"]}`
          }
        >
          {i + 1}
        </span>
      );
    }

    return linksArray;
  }

  function makeLinks() {
    let currentPage: number;
    let totalPages: number;

    if (typeof props.currentPage === "string") {
      currentPage = parseInt(props.currentPage);
    } else {
      currentPage = props.currentPage;
    }

    if (typeof props.totalPages === "string") {
      totalPages = parseInt(props.totalPages);
    } else {
      totalPages = props.totalPages;
    }

    let startI;
    let endI;

    if (totalPages <= 5) {
      startI = 0;
      endI = totalPages;
    } else if (currentPage <= 3) {
      startI = 0;
      endI = 5;
    } else if (totalPages - currentPage <= 2) {
      startI = totalPages - 5;
      endI = totalPages;
    } else {
      startI = currentPage - 3;
      endI = currentPage + 2;
    }

    switch (props.useCase) {
      case UseCases.SEARCH_RESULTS:
        return makeLinksArray(startI, endI, currentPage, searchResultsOnClick);
      case UseCases.REVIEWS:
        return makeLinksArray(startI, endI, currentPage, reviewsOnClick);
      case UseCases.RATINGS:
        return makeLinksArray(startI, endI, currentPage, ratingsOnClick);
      case UseCases.WATCHLIST:
        return makeLinksArray(startI, endI, currentPage, watchlistOnClick);
      case UseCases.OTHER_LIST:
        return makeLinksArray(startI, endI, currentPage, listOnClick);
    }
  }

  function makeLeftArrowIcons(page: number, onClickFunction: Function) {
    return (
      <span className={styles["left-buttons"]}>
        <span
          className={styles["icon-span"]}
          onClick={() => onClickFunction(1)}
        >
          <i className="fa-solid fa-backward-step fa-lg"></i>
        </span>
        <span
          className={styles["icon-span"]}
          onClick={() => onClickFunction(page)}
        >
          <i className="fa-solid fa-play fa-rotate-180"></i>
        </span>
      </span>
    );
  }

  function makeLeftArrows() {
    let previousPage: number;
    let page: number;

    if (typeof props.currentPage === "string") {
      previousPage = parseInt(props.currentPage) - 1;
    } else {
      previousPage = props.currentPage - 1;
    }

    if (previousPage <= 0) {
      page = 1;
    } else {
      page = previousPage;
    }

    switch (props.useCase) {
      case UseCases.SEARCH_RESULTS:
        return makeLeftArrowIcons(page, searchResultsOnClick);
      case UseCases.REVIEWS:
        return makeLeftArrowIcons(page, reviewsOnClick);
      case UseCases.RATINGS:
        return makeLeftArrowIcons(page, ratingsOnClick);
      case UseCases.WATCHLIST:
        return makeLeftArrowIcons(page, watchlistOnClick);
      case UseCases.OTHER_LIST:
        return makeLeftArrowIcons(page, listOnClick);
    }
  }

  function makeRightArrowIcons(page: number, onClickFuncion: Function) {
    let totalPages: number;

    if (typeof props.totalPages === "string") {
      totalPages = parseInt(props.totalPages);
    } else {
      totalPages = props.totalPages;
    }

    return (
      <span className={styles["right-buttons"]}>
        <span
          className={styles["icon-span"]}
          onClick={() => onClickFuncion(page)}
        >
          <i className="fa-solid fa-play"></i>
        </span>
        <span
          className={styles["icon-span"]}
          onClick={() => onClickFuncion(totalPages)}
        >
          <i className="fa-solid fa-forward-step fa-lg"></i>
        </span>
      </span>
    );
  }

  function makeRightArrows() {
    let nextPage: number;
    let totalPages: number;
    let page: number;

    if (typeof props.currentPage === "string") {
      nextPage = parseInt(props.currentPage) + 1;
    } else {
      nextPage = props.currentPage + 1;
    }

    if (typeof props.totalPages === "string") {
      totalPages = parseInt(props.totalPages);
    } else {
      totalPages = props.totalPages;
    }

    if (nextPage >= totalPages) {
      page = totalPages;
    } else {
      page = nextPage;
    }

    switch (props.useCase) {
      case UseCases.SEARCH_RESULTS:
        return makeRightArrowIcons(page, searchResultsOnClick);
      case UseCases.REVIEWS:
        return makeRightArrowIcons(page, reviewsOnClick);
      case UseCases.RATINGS:
        return makeRightArrowIcons(page, ratingsOnClick);
      case UseCases.WATCHLIST:
        return makeRightArrowIcons(page, watchlistOnClick);
      case UseCases.OTHER_LIST:
        return makeRightArrowIcons(page, listOnClick);
    }
  }

  return (
    <div className={styles["pagination"]}>
      {makeLeftArrows()}
      {makeLinks()}
      {makeRightArrows()}
    </div>
  );
}
