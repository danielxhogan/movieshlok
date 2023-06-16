import styles from "@/styles/components/Pagination.module.css";
import { FilterResults } from "@/pages/search";
import { getSearchResults, SearchParams } from "@/redux/actions/tmdb";
import { useAppDispatch } from "@/redux/hooks";

import { useRouter } from "next/router";

export enum UseCases {
  SEARCH_RESULTS
}

interface SearchResultsData {
  useCase: UseCases.SEARCH_RESULTS,
  currentPage: string;
  totalPages: string;
  searchQuery: string;
  filter: FilterResults;
}

type Props = SearchResultsData;

export default function Pagination(props: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  function onClickPaginationButton(page: string) {
    router.push(`/search?query=${props.searchQuery}&filter=${props.filter}&page=${page}`);
  //   const searchParams: SearchParams = {
  //     query: props.searchQuery,
  //     page,
  //     filter: props.filter
  // }

  // dispatch(getSearchResults(searchParams));

  }

  let currentPage_number;
  let totalPages_number;

  function makeLinks() {
    switch (props.useCase) {

      case UseCases.SEARCH_RESULTS:
        currentPage_number = parseInt(props.currentPage);
        totalPages_number = parseInt(props.totalPages);

        const linksArray = [];
        let startI;
        let endI;

        if (totalPages_number <= 5) {
          startI = 0;
          endI = totalPages_number;

        } else if (currentPage_number <= 3) {
          startI = 0;
          endI = 5;

        } else if ((totalPages_number - currentPage_number) <= 2) {
          startI = totalPages_number - 5;
          endI = totalPages_number;

        } else {
          startI = currentPage_number - 3;
          endI = currentPage_number + 2;
        }

        for (let i=startI; i<endI; i++) {
          const pageString = (i+1).toString();

          linksArray.push(
              <span
                onClick={ () => onClickPaginationButton(pageString) }
                className={
                  (i+1) === currentPage_number
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
        break;
    }
  }

  function makeLeftArrows() {
    switch (props.useCase) {

      case UseCases.SEARCH_RESULTS:
        const previousPageNumberInt = (parseInt(props.currentPage) - 1);
        let previousPageNumber: string = "";

        if (previousPageNumberInt <= 0) {
          previousPageNumber = (1).toString();
        } else {
          previousPageNumber = previousPageNumberInt.toString();
        }

        return (
          <span className={styles["left-buttons"]}>
              <span className={styles["icon-span"]} onClick={ () => onClickPaginationButton("1") }>
                <i className="fa-solid fa-chevron-left"></i>
                <i className="fa-solid fa-chevron-left"></i>
              </span>
              <span className={styles["icon-span"]} onClick={ () => onClickPaginationButton(previousPageNumber) }>
                <i className="fa-solid fa-chevron-left"></i>
              </span>
          </span>
        );
        break;
    }
  }

  function makeRightArrows() {
    switch (props.useCase) {

      case UseCases.SEARCH_RESULTS:
        const nextPageNumberInt = parseInt(props.currentPage) + 1;
        let nextPageNumber: string = "";

        if (nextPageNumberInt >= parseInt(props.totalPages)) {
          nextPageNumber = props.totalPages;
        } else {
          nextPageNumber = nextPageNumberInt.toString();
        }

        return (
          <span className={styles["right-buttons"]}>
              <span className={styles["icon-span"]} onClick={ () => onClickPaginationButton(nextPageNumber) }>
                <i className="fa-solid fa-chevron-right"></i>
              </span>
              <span className={styles["icon-span"]} onClick={ () => onClickPaginationButton(props.totalPages) }>
                <i className="fa-solid fa-chevron-right"></i>
                <i className="fa-solid fa-chevron-right"></i>
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