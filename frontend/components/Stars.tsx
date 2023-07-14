import styles from "@/styles/components/Stars.module.css";
import { useState, useEffect, useRef } from "react";

export enum Rating {
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
  initialRating: Rating;
  setParentRating: Function;
  interactive: boolean;
  size: string;
}

export default function Stars(props: Props) {
  const [currentRating, setCurrentRating] = useState(props.initialRating);
  const [newRating, setNewRating] = useState(currentRating);

  const starOneRef = useRef<HTMLElement>(null);
  const starTwoRef = useRef<HTMLElement>(null);
  const starThreeRef = useRef<HTMLElement>(null);
  const starFourRef = useRef<HTMLElement>(null);
  const starFiveRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!props.interactive) {
      return;
    }

    let insideStarOne = false;
    let insideStarTwo = false;
    let insideStarThree = false;
    let insideStarFour = false;
    let insideStarFive = false;

    if (
      !starOneRef ||
      !starTwoRef ||
      !starThreeRef ||
      !starFourRef ||
      !starFiveRef
    ) {
      return;
    }

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

    starOneRef.current?.addEventListener("mouseover", event => {
      insideStarOne = true;
    });

    starOneRef.current?.addEventListener("mouseout", event => {
      insideStarOne = false;
    });

    starTwoRef.current?.addEventListener("mouseover", event => {
      insideStarTwo = true;
    });

    starTwoRef.current?.addEventListener("mouseout", event => {
      insideStarTwo = false;
    });

    starThreeRef.current?.addEventListener("mouseover", event => {
      insideStarThree = true;
    });

    starThreeRef.current?.addEventListener("mouseout", event => {
      insideStarThree = false;
    });

    starFourRef.current?.addEventListener("mouseover", event => {
      insideStarFour = true;
    });

    starFourRef.current?.addEventListener("mouseout", event => {
      insideStarFour = false;
    });

    starFiveRef.current?.addEventListener("mouseover", event => {
      insideStarFive = true;
    });

    starFiveRef.current?.addEventListener("mouseout", event => {
      insideStarFive = false;
    });
  }, [props.id, props.interactive]);

  function makeStars(rating: Rating) {
    // prettier-ignore
    switch (rating) {
      case Rating.ZERO:
        return (
          <>
            <i ref={starOneRef} className={`fa-regular fa-star fa-${props.size}`}></i>
            <i ref={starTwoRef} className={`fa-regular fa-star fa-${props.size}`}></i>
            <i ref={starThreeRef} className={`fa-regular fa-star fa-${props.size}`}></i>
            <i ref={starFourRef} className={`fa-regular fa-star fa-${props.size}`}></i>
            <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          </>
        );
      case Rating.POINT_FIVE:
        return <>
          <i ref={starOneRef} className={`${ styles[`hs-${props.size}`]} fa-regular fa-star-half-stroke fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.ONE:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.ONE_POINT_FIVE:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`${ styles[`hs-${props.size}`]} fa-solid fa-star-half-stroke fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.TWO:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.TWO_POINT_FIVE:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`${ styles[`hs-${props.size}`]} fa-regular fa-star-half-stroke fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.THREE:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-regular fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.THREE_POINT_FIVE:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`${ styles[`hs-${props.size}`]} fa-solid fa-star-half-stroke fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.FOUR:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-regular fa-star fa-${props.size}`}></i>
        </>;
      case Rating.FOUR_POINT_FIVE:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`${ styles[`hs-${props.size}`]} fa-solid fa-star-half-stroke fa-${props.size}`}></i>
        </>;
      case Rating.FIVE:
        return <>
          <i ref={starOneRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starTwoRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starThreeRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFourRef} className={`fa-solid fa-star fa-${props.size}`}></i>
          <i ref={starFiveRef} className={`fa-solid fa-star fa-${props.size}`}></i>
        </>;
    }
  }

  function onClickStars() {
    setCurrentRating(newRating);
    props.setParentRating(newRating);
  }

  return (
    <>
      {props.interactive ? (
        <span
          id="stars"
          className={styles["stars"]}
          onMouseOut={() => setNewRating(currentRating)}
          onClick={onClickStars}
        >
          {makeStars(newRating)}
        </span>
      ) : (
        <span id="stars" className={styles["stars"]}>
          {makeStars(newRating)}
        </span>
      )}
    </>
  );
}
