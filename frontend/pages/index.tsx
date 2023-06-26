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

  const quotes = [
    <div key={1}>
      <p>&quot;This is how i win.&quot;</p>
      <div className={styles["movie"]}>Uncut Gems, 2019</div>
    </div>,
    <div key={2}>
      <p>&quot;This is how i lose.&quot;</p>
      <div className={styles["movie"]}>Cut Gems, 2019</div>
    </div>,
    <div key={3}>
      <p>&quot;This is why I'm hot.&quot;</p>
      <div className={styles["movie"]}>Cut Gems, 2019</div>
    </div>
  ]

  const setNextQuote = useCallback(() => {
    let nextQuote = quoteIdx + 1;
    if (nextQuote > quotes.length - 1) {
      nextQuote = 0;
    }
    setQuoteIdx(nextQuote);

  }, [quoteIdx, quotes.length]);

  const toggleQuotePicClass = useCallback(() => {
    switch (quotePicClass) {
      case SHOWN: setQuotePicClass(HIDDEN); break;
      case HIDDEN: setQuotePicClass(SHOWN); break;
    }
  }, [quotePicClass]);

  // const intervals = [];
  // const timers = [];

  setTimeout(() => {
    toggleQuotePicClass();
    setTimeout(() => setNextQuote(), 5000);
    // setNextQuote();
  }, 5000);

  // useEffect(() => {
  //   setInterval(() => {
  //     toggleQuotePicClass();
  //     setTimeout(() => setNextQuote(), 5000);
  //     // setNextQuote();
  //   }, 5000);
  // }, [setNextQuote, toggleQuotePicClass]);

  return <div className="wrapper">
    <Navbar />

    <div className={styles["quote-section"]}>
      <div className={`${styles["quote-pic"]} ${styles[quotePicClass]} content`}>
        <div className={styles["quote"]}>
          { quotes[quoteIdx] }
          {/* &quot;This is how I win&quot;
          <div className={styles["movie"]}>Uncut Gems, 2019</div> */}
        </div>

        <Image
          src="/uncut-gems.png"
          className={styles["pic"]}
          width={200}
          height={300}
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