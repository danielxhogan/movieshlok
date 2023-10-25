import {
  MoviesSearchResults,
  PeopleSearchResults,
} from "@/components/search/tmdb";
import api from "@/api/server";
import type { MoviesResults, PeopleResults } from "@/server/routers/tmdb";

export default async function SearchPage({
  params,
}: {
  params: { query: string; filter: string };
}) {
  function SearchHeading({ children }: { children: React.ReactNode }) {
    return <main className="w-full">{children}</main>;
  }

  function sortTMDBResults(results: MoviesResults | PeopleResults) {
    results.results.results = results.results.results.sort((a, b) => {
      if (a.popularity > b.popularity) {
        return -1;
      } else if (a.popularity < b.popularity) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  async function makeMoviesSearchResults() {
    let moviesResults: MoviesResults = await api.tmdbSearch.getMovies({
      query: params.query,
    });

    sortTMDBResults(moviesResults);

    return (
      <SearchHeading>
        <MoviesSearchResults
          initialResults={moviesResults.results}
          query={params.query}
        />
      </SearchHeading>
    );
  }

  async function makePeopleSearchResults() {
    let peopleResults: PeopleResults = await api.tmdbSearch.getPeople({
      query: params.query,
    });

    sortTMDBResults(peopleResults);

    return (
      <SearchHeading>
        <PeopleSearchResults
          initialResults={peopleResults.results}
          query={params.query}
        />
      </SearchHeading>
    );
  }

  switch (params.filter) {
    case "movie":
      return makeMoviesSearchResults();

    case "person":
      return makePeopleSearchResults();
  }
}
