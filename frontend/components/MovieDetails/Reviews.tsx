import styles from "@/styles/MovieDetails/Reviews.module.css";
import { useAppSelector } from "@/redux/hooks";
import { selectReveiws, Review } from "@/redux/reducers/reviews";

export default function Reviews() {
  const reviews = useAppSelector(selectReveiws);

  function makeReview(review: Review) {
    return <div className="block">
      <h3 className={styles["username"]}>{review.username}</h3>
      <p>{review.review}</p>
    </div>
  }

  return <div className={styles["wrapper"]}>
    <h2 className={styles["section-title"]}>Reviews</h2>
    { reviews.data.reviews && reviews.data.reviews.map(makeReview)}
  </div>
}


