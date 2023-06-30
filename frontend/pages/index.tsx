import styles from "@/styles/HomePage.module.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import Image from "next/image";
import pulpFiction from "@/public/pulp-fiction.png";
import theFavourite from "@/public/the-favourite.png";
import bansheesOfInisherin from "@/public/banshees-of-inisherin.png";
import scream from "@/public/scream.png";
import uncutGems from "@/public/uncut-gems.png";
import exMachina from "@/public/ex-machina.png";
import donnieDarko from "@/public/donnie-darko.png";
import theMatrix from "@/public/the-matrix.png";
import allThePresidentsMen from "@/public/all-the-presidents-men.png";
import thoroughbreds from "@/public/thoroughbreds.png";

import searchImg from "@/public/search.png";
import movieDetailsImg from "@/public/movie-details.png";
import reviewsImg from "@/public/reviews.png";

import { useCallback, useEffect, useState } from "react";

const SHOWN = "shown";
const HIDDEN = "hidden";


export default function HomePage() {
  const [ quotePicClass, setQuotePicClass ] = useState(SHOWN);
  const [ quoteIdx, setQuoteIdx ] = useState(0);
  const [ picIdx, setPicIdx ] = useState(0);

  const quotes = [
    <span key={0} className={styles["quote-text"]}>
      <p>&quot;Oh I&apos;m sorry, did I break your concentration?&quot;</p>
      <div className={styles["movie"]}>Pulp Fiction, 1994</div>
    </span>,
    <span key={2} className={styles["quote-text"]}>
      <p>&quot;Did you just look at me? Look at me! How Dare you!&quot;</p>
      <div className={styles["movie"]}>The Favourite, 2018</div>
    </span>,
    <span key={7} className={styles["quote-text"]}>
      <p>&quot;Dear Siobhan, obviously I don&apos;t know what &quot;ensconced&quot; is.&quot;</p>
      <div className={styles["movie"]}>The Banshees of Inisherin, 2022</div>
    </span>,
    <span key={1} className={styles["quote-text"]}>
      <p>&quot;What&apos;s your favorite scary movie?&quot;</p>
      <div className={styles["movie"]}>Scream, 1996</div>
    </span>,
    <span key={3} className={styles["quote-text"]}>
      <p>&quot;This is how I win.&quot;</p>
      <div className={styles["movie"]}>Uncut Gems, 2019</div>
    </span>,
    <span key={4} className={styles["quote-text"]}>
      <p>&quot;Isn&apos;t it strange, to create something that hates you?&quot;</p>
      <div className={styles["movie"]}>Ex Machina, 2015</div>
    </span>,
    <span key={5} className={styles["quote-text"]}>
      <p>&quot;Why do you wear that stupid bunny suit?&quot;</p>
      <p>&quot;Why do you wear that stupid man suit?&quot;</p>
      <div className={styles["movie"]}>Donnie Darko, 2001</div>
    </span>,
    <span key={8} className={styles["quote-text"]}>
      <p>&quot;Dodge this.&quot;</p>
      <div className={styles["movie"]}>The Matrix, 1999</div>
    </span>,
    <span key={6} className={styles["quote-text"]}>
      <p>&quot;He said he forgot the entire incident.&quot;</p>
      <p>&quot;That means he didn&apos;t deny it.&quot;</p>
      <p>&quot;It&apos;s a non-denial denial.&quot;</p>
      <div className={styles["movie"]}>All the Presidents Men, 1976</div>
    </span>,
    <span key={9} className={styles["quote-text"]}>
      <p>&quot;I have a perfectly healthy brain, it just doesn&apos;t contain feelings.&quot;</p>
      <div className={styles["movie"]}>Thoroughbreds, 2018</div>
    </span>,
  ];

  const pics = [
    pulpFiction,
    theFavourite,
    bansheesOfInisherin,
    scream,
    uncutGems,
    exMachina,
    donnieDarko,
    theMatrix,
    allThePresidentsMen,
    thoroughbreds
  ];

  function setNextQuote() {
    let nextQuote = quoteIdx + 1;
    if (nextQuote > quotes.length - 1) {
      nextQuote = 0;
    }
    setQuoteIdx(nextQuote);
  }

  function setNextPic() {
    let nextPic = picIdx + 1;
    if (nextPic > pics.length - 1) {
      nextPic = 0;
    }
    setPicIdx(nextPic);
  }

  const toggleQuotePicClass = useCallback(() => {
    switch (quotePicClass) {
      case SHOWN: setQuotePicClass(HIDDEN); break;
      case HIDDEN: setQuotePicClass(SHOWN); break;
    }
  }, [quotePicClass]);

  setTimeout(() => {
    toggleQuotePicClass();
    setTimeout(() => {
      setNextQuote();
      setNextPic();
    }, 5000);
  }, 5000);
  
  useEffect(() => {
    window.addEventListener('scroll', () => {
      const distanceScrolled = window.pageYOffset;
      // console.log(distanceScrolled);
      const searchImg = document.getElementById("searchImg");
      const movieDetailsImg = document.getElementById("movieDetailsImg");
      const reviewsImg = document.getElementById("reviewsImg");

      const fadeScrollLength = 400;
      const outInGap = 50;
      const inOutGap = 200;

      const fadeOut1Start = 350;
      const fadeOut1End = fadeOut1Start + fadeScrollLength;

      const fadeIn1Start = fadeOut1End + outInGap;
      const fadeIn1End = fadeIn1Start + fadeScrollLength;

      const fadeOut2Start = fadeIn1End + inOutGap;
      const fadeOut2End = fadeOut2Start + fadeScrollLength;

      const fadeIn2Start = fadeOut2End + outInGap;
      const fadeIn2End = fadeIn2Start + fadeScrollLength;

      if (searchImg && movieDetailsImg && reviewsImg) {
        if (distanceScrolled <= fadeOut1Start) {
          searchImg.style.opacity = "1";
          movieDetailsImg.style.opacity = "0";
          reviewsImg.style.opacity = "0";

        } else if (distanceScrolled > fadeOut1Start && distanceScrolled <= fadeOut1End) {
          searchImg.style.opacity = (1 - ((distanceScrolled - fadeOut1Start) / fadeScrollLength)).toString();
          movieDetailsImg.style.opacity = "0";
          reviewsImg.style.opacity = "0";

        } else if (distanceScrolled > fadeIn1Start && distanceScrolled <= fadeIn1End) {
          searchImg.style.opacity = "0";
          movieDetailsImg.style.opacity = ((distanceScrolled - fadeIn1Start) / fadeScrollLength).toString();
          reviewsImg.style.opacity = "0";

        } else if (distanceScrolled > fadeOut2Start && distanceScrolled <= fadeOut2End) {
          searchImg.style.opacity = "0";
          movieDetailsImg.style.opacity = (1 - ((distanceScrolled - fadeOut2Start) / fadeScrollLength)).toString();
          reviewsImg.style.opacity = "0";

        } else if (distanceScrolled > fadeIn2Start && distanceScrolled <= fadeIn2End) {
          searchImg.style.opacity = "0";
          movieDetailsImg.style.opacity = "0";
          reviewsImg.style.opacity = ((distanceScrolled - fadeIn2Start) / fadeScrollLength).toString();
        }
      }
    });
  }, []);

  return <div className="wrapper">
    <Navbar />

    <div className={styles["quote-section"]}>
      <div className={`${styles["quote-pic"]} ${styles[quotePicClass]} content`}>
        <div className={styles["quote"]}>
          { quotes[quoteIdx] }
        </div>

        <div className={styles["pic-div"]}>
          <Image src={pics[picIdx]}
            className={styles["pic"]}
            width={200}
            height={320}
            alt="uncut gems"
            loading="eager"
          />
        </div>
      </div>
    </div>

    <div className={`${styles["features-section"]} content`}>

      <div className={`${styles["features"]}`}>
        <div className={styles["feature"]}>
          <h3>Search Movie Info</h3>
          <div>
            <p>
              Use the searchbar to search for movies,
              cast & crew, or both
            </p>
          </div>
          <span>powered by the TMDB api</span>
          <Image
            src={searchImg}
            className={styles["column-feature-img"]}
            width={1034}
            height={528}
            alt="search image"
          />
        </div>

        <div className={styles["feature"]}>
          <h3>View Movie Details</h3>
          <div>
            <p>
              Click on a movie search result to watch the trailer,
              read the synopsis, or view details about cast & crew
            </p>
          </div>
          <Image
            src={movieDetailsImg}
            className={styles["column-feature-img"]}
            width={1298}
            height={663}
            alt="movie details"
          />
        </div>

        <div className={`${styles["feature"]} ${styles["last-feature"]}`}>
          <h3>Leave A Review</h3>
          <div>
            <p>
              On the movie details page you can read reviews left by other users
            </p>
            <p>
              Once you&apos;ve made an account, you can like, rate, and review
              any movie you want
            </p>
          </div>
          <Image
            src={reviewsImg}
            className={styles["column-feature-img"]}
            width={1231}
            height={635}
            alt="reviews"
          />
        </div>
      </div>

      <div className={styles["feature-img-section"]}>
        <Image
          id="searchImg"
          src={searchImg}
          className={styles["feature-img"]}
          width={1034}
          height={528}
          alt="search image"
        />
        <Image
          id="movieDetailsImg"
          src={movieDetailsImg}
          className={styles["feature-img"]}
          width={1298}
          height={663}
          alt="movie details"
        />
        <Image
          id="reviewsImg"
          src={reviewsImg}
          className={styles["feature-img"]}
          width={1231}
          height={635}
          alt="reviews"
        />
      </div>
    </div>

    <div className="content">
    </div>
    <Footer />
  </div>
}