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

  async function makeMoviesSearchResults() {
    const moviesResults: MoviesResults = await api.tmdbSearch.getMovies({
      query: params.query,
    });

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
    const peopleResults: PeopleResults = await api.tmdbSearch.getPeople({
      query: params.query,
    });

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
