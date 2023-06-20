import styles from "@/styles/components/Stars.module.css";
import { useState, useEffect } from "react";

enum Rating {
  ZERO,
  POINT_FIVE,
  ONE,
  ONE_POINT_FIVE,
  TWO,
  TWO_POINT_FIVE,
  THREE,
  THREE_POINT_FIVE,
  FOUR,
  FOUR_POINT_FIVE,
  FIVE
}

interface Props {
  id: string;
  initialCurrentRating: Rating;
  setParentCurrentRating: Function;
  // setParentNewRating: Function;
}


export default function Stars(props: Props) {
  const [ currentRating, setCurrentRating ] = useState(props.initialCurrentRating);
  const [ newRating, setNewRating ] = useState(currentRating);

  useEffect(() => {
    let starOne: HTMLElement | null = null;
    let starTwo: HTMLElement | null = null;
    let starThree: HTMLElement | null = null;
    let starFour: HTMLElement | null = null;
    let starFive: HTMLElement | null = null;

    let insideStarOne = false;
    let insideStarTwo = false;
    let insideStarThree = false;
    let insideStarFour = false;
    let insideStarFive = false;

    const starsInterval = setInterval(() => {
      starOne = document.getElementById(`${props.id}-star-one`);
      starTwo = document.getElementById(`${props.id}-star-two`);
      starThree = document.getElementById(`${props.id}-star-three`);
      starFour = document.getElementById(`${props.id}-star-four`);
      starFive = document.getElementById(`${props.id}-star-five`);

      if ( !starOne || !starTwo || !starThree || !starFour || !starFive ) { return; }
      clearInterval(starsInterval);

      window.addEventListener("mousemove", event => {
        if (insideStarOne) {
          if (event.offsetX < 20) {
            setNewRating(Rating.POINT_FIVE);
          } else {
            setNewRating(Rating.ONE);
          }

        } else if (insideStarTwo) {
          if (event.offsetX < 20) {
            setNewRating(Rating.ONE_POINT_FIVE);
          } else {
            setNewRating(Rating.TWO);
          }

        } else if (insideStarThree) {
          if (event.offsetX < 20) {
            setNewRating(Rating.TWO_POINT_FIVE);
          } else {
            setNewRating(Rating.THREE);
          }

        } else if (insideStarFour) {
          if (event.offsetX < 20) {
            setNewRating(Rating.THREE_POINT_FIVE);
          } else {
            setNewRating(Rating.FOUR);
          }

        } else if (insideStarFive) {
          if (event.offsetX < 20) {
            setNewRating(Rating.FOUR_POINT_FIVE);
          } else {
            setNewRating(Rating.FIVE);
          }
        }
      });

      starOne.addEventListener("mouseover", (event) => {
        insideStarOne = true;
      });

      starOne.addEventListener("mouseout", (event) => {
        insideStarOne = false;
      });

      starTwo.addEventListener("mouseover", (event) => {
        insideStarTwo = true;
      });

      starTwo.addEventListener("mouseout", (event) => {
        insideStarTwo = false;
      });

      starThree.addEventListener("mouseover", (event) => {
        insideStarThree = true;
      });

      starThree.addEventListener("mouseout", (event) => {
        insideStarThree = false;
      });

      starFour.addEventListener("mouseover", (event) => {
        insideStarFour = true;
      });

      starFour.addEventListener("mouseout", (event) => {
        insideStarFour = false;
      });

      starFive.addEventListener("mouseover", (event) => {
        insideStarFive = true;
      });

      starFive.addEventListener("mouseout", (event) => {
        insideStarFive = false;
      });

    }, 100);  // end interval
  });

  function makeStars(rating: Rating) {
    switch (rating) {
      case Rating.ZERO:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.POINT_FIVE:
        return <>
          <i id={`${props.id}-star-one`} className={`${styles["half-star"]} fa-regular fa-star-half-stroke fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.ONE:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.ONE_POINT_FIVE:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`${styles["half-star"]} fa-solid fa-star-half-stroke fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.TWO:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.TWO_POINT_FIVE:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`${styles["half-star"]} fa-regular fa-star-half-stroke fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.THREE:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-regular fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.THREE_POINT_FIVE:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`${styles["half-star"]} fa-solid fa-star-half-stroke fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.FOUR:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-regular fa-star fa-2xl`}></i>
        </>
      case Rating.FOUR_POINT_FIVE:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`${styles["half-star"]} fa-solid fa-star-half-stroke fa-2xl`}></i>
        </>
      case Rating.FIVE:
        return <>
          <i id={`${props.id}-star-one`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-two`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-three`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-four`} className={`fa-solid fa-star fa-2xl`}></i>
          <i id={`${props.id}-star-five`} className={`fa-solid fa-star fa-2xl`}></i>
        </>
    }
  }

  function onClickStars() {
    setCurrentRating(newRating);
    props.setParentCurrentRating(newRating);
  }

  return <span id="stars"
    className={styles["stars"]}
    onMouseOut={() => setNewRating(currentRating)}
    onClick={onClickStars}
    >
    { makeStars(newRating) }
  </span>
}