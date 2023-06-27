import styles from "@/styles/HomePage.module.css";
import Navbar from "@/components/Navbar";
import Searchbar from "@/components/Searchbar";
import Footer from "@/components/Footer";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const SHOWN = "shown";
const HIDDEN = "hidden";

export default function HomePage() {

  const [ quotePicClass, setQuotePicClass ] = useState(SHOWN);
  const [ quoteIdx, setQuoteIdx ] = useState(0);
  const [ picIdx, setPicIdx ] = useState(0);

  const quotes = [
    <span key={1} className={styles["quote-text"]}>
      <p>&quot;Oh I&apos;m sorry, did I break your concentration?&quot;</p>
      <div className={styles["movie"]}>Pulp Fiction, 1994</div>
    </span>,
    <span key={2} className={styles["quote-text"]}>
      <p>&quot;Did you just look at me? Look at me! How Dare you!&quot;</p>
      <div className={styles["movie"]}>The Favourite, 2018</div>
    </span>,
    <span key={3} className={styles["quote-text"]}>
      <p>&quot;This is how i win.&quot;</p>
      <div className={styles["movie"]}>Uncut Gems, 2019</div>
    </span>,
    <span key={4} className={styles["quote-text"]}>
      <p>&quot;What&apos;s your favorite scary movie?&quot;</p>
      <div className={styles["movie"]}>Scream, 1996</div>
    </span>,
    <span key={5} className={styles["quote-text"]}>
      <p>&quot;Why do you wear that stupid bunny suit?&quot;</p>
      <p>&quot;Why do you wear that stupid man suit?&quot;</p>
      <div className={styles["movie"]}>Donnie Darko, 2001</div>
    </span>
  ];

  const pics = [
    "/pulp-fiction.png",
    "/the-favourite.png",
    "/uncut-gems.png",
    "/scream.png",
    "/donnie-darko.png"
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

  return <div className="wrapper">
    <Navbar />

    <div className={styles["quote-section"]}>
      <div className={`${styles["quote-pic"]} ${styles[quotePicClass]} content`}>
        <div className={styles["quote"]}>
          { quotes[quoteIdx] }
        </div>

        <Image
          src={pics[picIdx]}
          className={styles["pic"]}
          width={200}
          height={320}
          alt="uncut gems"
        />
      </div>
    </div>

    <div className="content">
      {/* <Searchbar /> */}
    </div>
    <Footer />
  </div>
}