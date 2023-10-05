import styles from "@/styles/u/RatingsPage.module.css";
import Stars from "@/components/Stars";
import { RatingReview } from "@/redux/actions/reviews";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import { Tooltip } from "@chakra-ui/react";

const TMDB_IMAGE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL;

type Props = {
  id: number;
  rating: RatingReview;
  date: number;
  onClickDeleteRating?: Function | null;
};

export default function Rating(props: Props) {
  const router = useRouter();

  const ratingElement = (
    <div key={props.id} className={`${styles["rating"]} block`}>
      {props.onClickDeleteRating && (
        // @ts-ignore
        <Tooltip label={"delete rating"} placement="top">
          <i
            className={`${styles["delete-rating"]} fa-solid fa-trash fa-md`}
            onClick={() =>
              props.onClickDeleteRating &&
              props.onClickDeleteRating(props.rating)
            }
          />
        </Tooltip>
      )}

      <span className={styles["rating-left"]}>
        <span className={styles["day"]}>{props.date}</span>

        <span className={styles["poster-section"]}>
          <Image
            src={`${TMDB_IMAGE_URL}/w342${props.rating.poster_path}`}
            className={styles["movie-poster"]}
            onClick={() => {
              router.push(`/details/movie/${props.rating.movie_id}`);
            }}
            width={75}
            height={0}
            alt="backdrop"
          ></Image>

          <span className={styles["title-section"]}>
            <span
              className={styles["movie-title"]}
              onClick={() => {
                router.push(`/details/movie/${props.rating.movie_id}`);
              }}
            >
              {props.rating.movie_title}
            </span>

            <span className={styles["icons"]}>
              <span className={styles["rating-like"]}>
                <Stars
                  id={props.id.toString()}
                  size={"sm"}
                  interactive={false}
                  initialRating={props.rating.rating}
                  setParentRating={() => {}}
                />

                {props.rating.liked ? (
                  <i
                    className={`fa-solid fa-heart fa-sm ${styles["heart"]}`}
                  ></i>
                ) : (
                  <i
                    className={`fa-regular fa-heart fa-sm ${styles["heart"]}`}
                  ></i>
                )}
              </span>

              {props.rating.review_id ? (
                <span className={styles["review"]}>
                  <Link
                    href={`/u/${router.query.username}/review?id=${props.rating.review_id}&movieId=${props.rating.movie_id}`}
                  >
                    <i className="fa-solid fa-bars-staggered fa-sm"></i>
                  </Link>
                </span>
              ) : (
                <span className={styles["review"]}>
                  <i></i>
                </span>
              )}
            </span>
          </span>
        </span>
      </span>

      <span className={styles["rating-right"]}>
        <span className={styles["rating-like"]}>
          <Stars
            id={props.id.toString()}
            size={"lg"}
            interactive={false}
            initialRating={props.rating.rating}
            setParentRating={() => {}}
          />

          {props.rating.liked ? (
            <i className={`fa-solid fa-heart fa-lg ${styles["heart"]}`}></i>
          ) : (
            <i className={`fa-regular fa-heart fa-lg ${styles["heart"]}`}></i>
          )}
        </span>

        {props.rating.review_id ? (
          <span className={styles["review"]}>
            <Link
              href={`/u/${router.query.username}/review?id=${props.rating.review_id}&movieId=${props.rating.movie_id}`}
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </Link>
          </span>
        ) : (
          <span className={styles["review"]}>
            <i></i>
          </span>
        )}
      </span>
    </div>
  ); // end rating

  return (
    <div key={props.id} className={`${styles["rating"]} block`}>
      {props.onClickDeleteRating && (
        // @ts-ignore
        <Tooltip label={"delete rating"} placement="top">
          <i
            className={`${styles["delete-rating"]} fa-solid fa-trash fa-md`}
            onClick={() =>
              props.onClickDeleteRating &&
              props.onClickDeleteRating(props.rating)
            }
          />
        </Tooltip>
      )}

      <span className={styles["rating-left"]}>
        <span className={styles["day"]}>{props.date}</span>

        <span className={styles["poster-section"]}>
          <Image
            src={`${TMDB_IMAGE_URL}/w342${props.rating.poster_path}`}
            className={styles["movie-poster"]}
            onClick={() => {
              router.push(`/details/movie/${props.rating.movie_id}`);
            }}
            width={75}
            height={0}
            alt="backdrop"
          ></Image>

          <span className={styles["title-section"]}>
            <span
              className={styles["movie-title"]}
              onClick={() => {
                router.push(`/details/movie/${props.rating.movie_id}`);
              }}
            >
              {props.rating.movie_title}
            </span>

            <span className={styles["icons"]}>
              <span className={styles["rating-like"]}>
                <Stars
                  id={props.id.toString()}
                  size={"sm"}
                  interactive={false}
                  initialRating={props.rating.rating}
                  setParentRating={() => {}}
                />

                {props.rating.liked ? (
                  <i
                    className={`fa-solid fa-heart fa-sm ${styles["heart"]}`}
                  ></i>
                ) : (
                  <i
                    className={`fa-regular fa-heart fa-sm ${styles["heart"]}`}
                  ></i>
                )}
              </span>

              {props.rating.review_id ? (
                <span className={styles["review"]}>
                  <Link
                    href={`/u/${router.query.username}/review?id=${props.rating.review_id}&movieId=${props.rating.movie_id}`}
                  >
                    <i className="fa-solid fa-bars-staggered fa-sm"></i>
                  </Link>
                </span>
              ) : (
                <span className={styles["review"]}>
                  <i></i>
                </span>
              )}
            </span>
          </span>
        </span>
      </span>

      <span className={styles["rating-right"]}>
        <span className={styles["rating-like"]}>
          <Stars
            id={props.id.toString()}
            size={"lg"}
            interactive={false}
            initialRating={props.rating.rating}
            setParentRating={() => {}}
          />

          {props.rating.liked ? (
            <i className={`fa-solid fa-heart fa-lg ${styles["heart"]}`}></i>
          ) : (
            <i className={`fa-regular fa-heart fa-lg ${styles["heart"]}`}></i>
          )}
        </span>

        {props.rating.review_id ? (
          <span className={styles["review"]}>
            <Link
              href={`/u/${router.query.username}/review?id=${props.rating.review_id}&movieId=${props.rating.movie_id}`}
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </Link>
          </span>
        ) : (
          <span className={styles["review"]}>
            <i></i>
          </span>
        )}
      </span>
    </div>
  );
}
