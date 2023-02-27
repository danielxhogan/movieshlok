import styles from "@/styles/components/Pagination.module.css";
import { FilterResults } from "@/pages/search";

import { Link } from "@chakra-ui/react";
import NextLink from "next/link";

export enum Api {
  TMDB,
  WPGRAPHQL
}

type TMDBProps = {
  api: Api.TMDB;
  currentPage: string;
  totalPages: string;
  searchQuery: string;
  filter: FilterResults;
}

type WPGRAPHQLProps = {
  api: Api.WPGRAPHQL;
  limit: string;
  totalResults: string;
}

type Props = TMDBProps | WPGRAPHQLProps;

export default function Pagination(props: Props) {
  let currentPage_number;
  let totalPages_number;

  function makeLinks() {
    switch (props.api) {

      case Api.TMDB:
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
          linksArray.push(
            <Link key={i} as={NextLink} href={`/search?q=${props.searchQuery}&f=${props.filter}&p=${i+1}`}>
              <span
                className={
                  (i+1) === currentPage_number
                  ?
                  `${styles["current-page"]} ${styles["page-button"]}`
                  :
                  `${styles["page-button"]}`}
                  >

                { i + 1 }

              </span>
            </Link>
          )
        }
        return linksArray;
        break;

      case Api.WPGRAPHQL:
        break;
    }
  }

  function makeLeftArrows() {
    switch (props.api) {

      case Api.TMDB:
        const previousPageNumber = parseInt(props.currentPage) - 1;

        return (
          <span className={styles["left-buttons"]}>
            <Link as={NextLink} href={`/search?q=${props.searchQuery}&f=${props.filter}&p=1`}>
              <span className={styles["icon-span"]}>
                <i className="fa-solid fa-chevron-left"></i>
                <i className="fa-solid fa-chevron-left"></i>
              </span>
            </Link>
            <Link as={NextLink} href={`/search?q=${props.searchQuery}&f=${props.filter}&p=${previousPageNumber}`}>
              <span className={styles["icon-span"]}>
                <i className="fa-solid fa-chevron-left"></i>
              </span>
            </Link>
          </span>

        )
        break;

      case Api.WPGRAPHQL:
        break;
    }
  }

  function makeRightArrows() {
    switch (props.api) {

      case Api.TMDB:
        const nextPageNumber = parseInt(props.currentPage) + 1;

        return (
          <span className={styles["right-buttons"]}>
            <Link as={NextLink} href={`/search?q=${props.searchQuery}&f=${props.filter}&p=${nextPageNumber}`}>
              <span className={styles["icon-span"]}>
                <i className="fa-solid fa-chevron-right"></i>
              </span>
            </Link>
            <Link as={NextLink} href={`/search?q=${props.searchQuery}&f=${props.filter}&p=${props.totalPages}`}>
              <span className={styles["icon-span"]}>
                <i className="fa-solid fa-chevron-right"></i>
                <i className="fa-solid fa-chevron-right"></i>
              </span>
            </Link>
          </span>

        )
        break;

      case Api.WPGRAPHQL:
        break;
    }
  }

  return <div className={styles["pagination"]}>
    { makeLeftArrows() }

    { makeLinks() }

    { makeRightArrows() }
  </div>
}