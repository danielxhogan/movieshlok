import {
  MovieSearchResults,
  PeopleSearchResults,
} from "@/components/search/tmdbSearch";
import api from "@/api/server";
import { type RouterOutputs } from "oldpages/client";

type MoviesResults = RouterOutputs["tmdbSearch"]["getMovies"];
type PeopleResults = RouterOutputs["tmdbSearch"]["getPeople"];

export default async function SearchPage({
  params,
}: {
  params: { query: string; filter: string };
}) {
  switch (params.filter) {
    case "movie":
      const moviesResults: MoviesResults = await api.tmdbSearch.getMovies({
        query: params.query,
      });

      return (
        <main>
          Search Page
          <MovieSearchResults
            initialResults={moviesResults}
            query={params.query}
          />
        </main>
      );

    case "person":
      const peopleResults: PeopleResults = await api.tmdbSearch.getPeople({
        query: params.query,
      });

      return (
        <main>
          Search Page
          <PeopleSearchResults
            initialResults={peopleResults}
            query={params.query}
          />
        </main>
      );
  }
}
