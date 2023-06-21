import styles from "@/styles/components/Pagination.module.css";
import { FilterResults } from "@/pages/search";
import { useAppDispatch } from "@/redux/hooks";

import { useRouter } from "next/router";

export enum UseCases {
  SEARCH_RESULTS,
  REVIEWS
}

interface SearchResultsData {
  useCase: UseCases.SEARCH_RESULTS,
  currentPage: string;
  totalPages: string;
  searchQuery: string;
  filter: FilterResults;
}

interface ReviewsData {
  useCase: UseCases.REVIEWS,
  currentPage: number;
  totalPages: number;
  movieId: string;
}

type Props = SearchResultsData | ReviewsData;

export default function Pagination(props: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  function searchResultsOnClick(page: number) {
    if (props.useCase === UseCases.SEARCH_RESULTS) {
      router.push(`/search?query=${props.searchQuery}&filter=${props.filter}&page=${page}`);
    }
  }

  function makeLinksArray(startI: number, endI: number, currentPage: number, onClickFuncion: Function) {
    const linksArray = [];

    for (let i=startI; i<endI; i++) {
      const pageNumber = i + 1;

      linksArray.push(
          <span
            key={i}
            onClick={ () => onClickFuncion(pageNumber) }
            className={
              (i+1) === currentPage
              ?
              `${styles["current-page"]} ${styles["page-button"]}`
              :
              `${styles["page-button"]}`}
              >

            { i + 1 }

          </span>
      )
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

    } else if ((totalPages - currentPage) <= 2) {
      startI = totalPages - 5;
      endI = totalPages;

    } else {
      startI = currentPage - 3;
      endI = currentPage + 2;
    }

    switch (props.useCase) {
      case UseCases.SEARCH_RESULTS:
        return makeLinksArray(startI, endI, currentPage, searchResultsOnClick);
    }
  }

  function makeLeftArrows() {
    switch (props.useCase) {
      case UseCases.SEARCH_RESULTS:
        const previousPage = parseInt(props.currentPage) - 1;
        let page: number;

        if (previousPage <= 0) {
          page = 1;
        } else {
          page = previousPage;
        }

        return (
          <span className={styles["left-buttons"]}>
              <span className={styles["icon-span"]} onClick={ () => searchResultsOnClick(1) }>
                <i className="fa-solid fa-backward-step fa-lg"></i>
              </span>
              <span className={styles["icon-span"]} onClick={ () => searchResultsOnClick(page) }>
                <i className="fa-solid fa-play fa-rotate-180"></i>
              </span>
          </span>
        );
        break;
    }
  }

  function makeRightArrows() {
    switch (props.useCase) {
      case UseCases.SEARCH_RESULTS:
        const nextPage = parseInt(props.currentPage) +1;
        const totalPages = parseInt(props.totalPages);
        let page: number;

        if (nextPage >= totalPages) {
          page = totalPages;
        } else {
          page = nextPage;
        }

        return (
          <span className={styles["right-buttons"]}>
              <span className={styles["icon-span"]} onClick={ () => searchResultsOnClick(page) }>
                <i className="fa-solid fa-play"></i>
              </span>
              <span className={styles["icon-span"]} onClick={ () => searchResultsOnClick(totalPages) }>
                <i className="fa-solid fa-forward-step fa-lg"></i>
              </span>
          </span>
        );
        break;
    }
  }

  return <div className={styles["pagination"]}>
    { makeLeftArrows() }
    { makeLinks() }
    { makeRightArrows() }
  </div>
}