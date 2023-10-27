"use client";

import { type Video } from "@/tmdb/details";
import { useState, useRef, useEffect } from "react";

export default function Trailer({ trailer }: { trailer: Video }) {
  const [shown, setShown] = useState(false);
  const trailerModalRef = useRef<HTMLDivElement>(null);
  const trailerButtonRef = useRef<HTMLButtonElement>(null);

  const flag = useRef<boolean>(false);

  useEffect(() => {
    if (!flag.current) {
      flag.current = true;

      function closeTrailer(event: MouseEvent) {
        if (
          !trailerModalRef.current?.contains(event.target as Node) &&
          !trailerButtonRef.current?.contains(event.target as Node)
        ) {
          setShown(false);
        }
      }

      document.addEventListener("click", closeTrailer);
    }
  }, [shown]);

  return (
    <section>
      <button
        ref={trailerButtonRef}
        onClick={() => setShown(!shown)}
        className="border-shadow hover:bg-shadow hover:text-invertedfg rounded border px-2 py-1 transition-all"
      >
        Play Trailer
      </button>

      <div className="flex justify-center">
        <div
          className={`absolute top-0 mx-auto h-full w-full px-3 ${
            shown
              ? "visible opacity-100 transition-all"
              : "invisible opacity-0 transition-all"
          }`}
        >
          <div
            className={`sticky transition-all ${shown ? "top-20" : "top-10"}`}
          >
            <div
              ref={trailerModalRef}
              className="bg-primarybg border-shadow mx-auto flex h-[325px] flex-col rounded border p-6 pt-10 sm:h-[363px] sm:w-[608px]"
            >
              {shown && (
                <iframe
                  // width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${trailer.key}?si=-bIkBtuhd2AEROWc&autoplay=true`}
                  // src={`https://www.youtube.com/embed/${trailer.key}?si=-bIkBtuhd2AEROWc`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="rounded"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
