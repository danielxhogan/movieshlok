import styles from "@/styles/components/Pagination.module.css";
import { FilterResults } from "@/pages/m/search";

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
        console.log(totalPages_number);

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
            <span
              key={i}
              className={
                (i+1) === currentPage_number
                ?
                `${styles["current-page"]} ${styles["page-button"]}`
                :
                `${styles["page-button"]}`}
              onClick={() => { window.location.href = `/m/search?q=${props.searchQuery}&f=${props.filter}&p=${i+1}`; }}
                >

              { i + 1 }

            </span>
          )
        }
        return linksArray;
        break;

      case Api.WPGRAPHQL:
        break;
    }
  }


  return <div className={styles["pagination"]}>
    <span className={styles["left-buttons"]}>
      <span className={styles["icon-span"]}>
        <i className="fa-solid fa-chevron-left"></i>
        <i className="fa-solid fa-chevron-left"></i>
      </span>
      <span className={styles["icon-span"]}>
        <i className="fa-solid fa-chevron-left"></i>
      </span>
    </span>

    { makeLinks() }

    <span className={styles["right-buttons"]}>
      <span className={styles["icon-span"]}>
        <i className="fa-solid fa-chevron-right"></i>
      </span>
      <span className={styles["icon-span"]}>
        <i className="fa-solid fa-chevron-right"></i>
        <i className="fa-solid fa-chevron-right"></i>
      </span>
    </span>
  </div>
}