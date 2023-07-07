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
import { useEffect } from "react";
import { Spinner } from "@chakra-ui/react";

import getConfig from "next/config";
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

  let currentMonth = 13;

  function makeRating(rating: RatingReview, idx: number) {
    if ( !rating ) { return; }

    const date = new Date(rating.timestamp * 1000);
    const month = date.getMonth();
    let monthText: string = "";
    let monthHeading: JSX.Element | null;

    if (month < currentMonth) {
      currentMonth = month;

      switch (month) {
        case 0: monthText = "January"; break;
        case 1: monthText = "February"; break;
        case 2: monthText = "March"; break;
        case 3: monthText = "April"; break;
        case 4: monthText = "May"; break;
        case 5: monthText = "June"; break;
        case 6: monthText = "July"; break;
        case 7: monthText = "August"; break;
        case 8: monthText = "September"; break;
        case 9: monthText = "October"; break;
        case 10: monthText = "November"; break;
        case 11: monthText = "December"; break;
      }
      
      monthHeading = <h2 className={styles["month-heading"]}>
        <span className={styles["month"]}>{monthText}</span> {date.getFullYear()}
      </h2>;

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
            <span className={styles["movie-title"]}
            onClick={ () => { router.push(`/details/movie/${rating.movie_id}`) }}
            >{ rating.movie_title }</span>

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

      <h1 className="page-title">
        <span className="username">{ router.query.username }&apos;s</span> Ratings
      </h1>

      { ratings.status === "fulfilled" ?
      <>
        { ratings.ratings && ratings.ratings.map(( rating, idx ) => makeRating(rating, idx)) }
        { ratings.ratings && ratings.ratings[0] === null &&
          <div className={styles["no-ratings"]}>No ratings from { router.query.username} yet</div>
        }
      </> : <>
        <div className="spinner">
          <Spinner size='xl' />
        </div>
      </>
      }

    </div>

    <Footer />
  </div>
}