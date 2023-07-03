import styles from "@/styles/u/RatingsPage.module.css";
import Navbar from "@/components/Navbar"
import ProfileNav from "@/components/ProfileNav";
import Stars from "@/components/Stars";
import Footer from "@/components/Footer";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getRatings, GetRatingsRequest, RatingReview } from "@/redux/actions/reviews";
import { selectRatings } from "@/redux/reducers/reviews";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

import getConfig from "next/config";
import { JsxElement } from "typescript";
const { publicRuntimeConfig } = getConfig();
const TMDB_IMAGE_URL = publicRuntimeConfig.TMDB_IMAGE_URL;

export default function ReviewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const ratings = useAppSelector(selectRatings);

  useEffect(() => {
    const username = router.query.username;

    if (typeof username === "string") {
      const getRatingsRequest: GetRatingsRequest = {
        username,
        page: 1
      }

      dispatch(getRatings(getRatingsRequest));
    }
  }, [dispatch, router.query.username]);

  let currentMonth = 0;

  function makeRating(rating: RatingReview, idx: number) {
    const date = new Date(rating.timestamp * 1000);
    const month = date.getMonth();
    let monthText: string = "";
    let monthHeading: JSX.Element | null;

    if (month > currentMonth) {
      currentMonth = month;

      switch (month) {
        case 1: monthText = "January"; break;
        case 2: monthText = "February"; break;
        case 3: monthText = "March"; break;
        case 4: monthText = "April"; break;
        case 5: monthText = "May"; break;
        case 6: monthText = "June"; break;
        case 7: monthText = "July"; break;
        case 8: monthText = "August"; break;
        case 9: monthText = "September"; break;
        case 10: monthText = "October"; break;
        case 11: monthText = "November"; break;
        case 12: monthText = "December"; break;
      }
      
      monthHeading = <h2>{monthText} {date.getFullYear()}</h2>;

    } else {
      monthHeading = null;
    }

    const ratingElement = <div key={idx} className={`${styles["rating"]} block`}>
      <span className={styles["rating-left"]}>
        <span className={styles["day"]}>{ date.getDate() }</span>

        <span className={styles["poster-section"]}>
          <Image
            src={`${TMDB_IMAGE_URL}/w342${rating.poster_path}`}
            className={styles["movie-poster"]}
            onClick={ () => { router.push(`/details/movie/${rating.movie_id}`) }}
            width={75}
            height={0}
            alt="backdrop">
          </Image>

          <span className={styles["title-section"]}>
            <span className={styles["movie-title"]}>{ rating.movie_title }</span>

            <span className={styles["icons"]}>
              <span className={styles["rating-like"]}>
                <Stars
                  id={idx.toString()}
                  size={"sm"}
                  interactive={false}
                  initialRating={rating.rating}
                  setParentRating={()=>{}}
                  />

                { rating.liked ?
                  <i className={`fa-solid fa-heart fa-sm ${styles["heart"]}`}></i>
                :
                  <i className={`fa-regular fa-heart fa-sm ${styles["heart"]}`}></i>
                }
              </span>

              { rating.review_id ?
                <span className={styles["review"]}>
                  <Link href={`/u/${router.query.username}/review?id=${rating.review_id}&movieId=${rating.movie_id}`}>
                    <i className="fa-solid fa-bars-staggered fa-sm"></i>
                  </Link>
                </span>
                :
                <span className={styles["review"]}>
                  <i></i>
                </span>
              }
            </span> {/* end icons */}
          </span> {/* end title-section */}
        </span> {/* end poster-section */}
      </span> {/* end rating-left */}

      <span className={styles["rating-right"]}>
        <span className={styles["rating-like"]}>
          <Stars
            id={idx.toString()}
            size={"lg"}
            interactive={false}
            initialRating={rating.rating}
            setParentRating={()=>{}}
            />
          { rating.liked }

          { rating.liked
          ?
            <i className={`fa-solid fa-heart fa-lg ${styles["heart"]}`}></i>
          :
            <i className={`fa-regular fa-heart fa-lg ${styles["heart"]}`}></i>
          }
        </span>

        { rating.review_id ?
          <span className={styles["review"]}>
            <Link href={`/u/${router.query.username}/review?id=${rating.review_id}&movieId=${rating.movie_id}`}>
              <i className="fa-solid fa-bars-staggered"></i>
            </Link>
          </span>
          :
          <span className={styles["review"]}>
            <i></i>
          </span>
        }
      </span>
    </div> // end rating

    if (monthHeading) {
      return <>
        { monthHeading }
        { ratingElement }
      </>;

    } else {
      return ratingElement;
    }

  }


  return <div className="wrapper">
    <Navbar />

    <div className="content">
      <ProfileNav />

      <h1 className={styles["page-title"]}>
        <span className={styles["username"]}>{ router.query.username }&apos;s</span> Ratings
      </h1>

      { ratings.ratings && ratings.ratings.map(( rating, idx ) => makeRating(rating, idx)) }
    </div>

    <Footer />
  </div>
}