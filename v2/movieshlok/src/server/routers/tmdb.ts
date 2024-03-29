import { type RouterOutputs } from "@/api/types";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { getMovies, getPeople } from "@/tmdb/search";
import { getMovie, getPerson } from "@/tmdb/details";
import { z } from "zod";

export type MoviesResults = RouterOutputs["tmdbSearch"]["getMovies"];
export type PeopleResults = RouterOutputs["tmdbSearch"]["getPeople"];

export const tmdbSearchRouter = createTRPCRouter({
  getMovies: publicProcedure
    .input(
      z.object({
        query: z.string(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const results = await getMovies(input.query, input.cursor ?? 1);
      const nextPage = input.cursor ? input.cursor + 1 : 1;

      return {
        results,
        nextPage,
      };
    }),
  getPeople: publicProcedure
    .input(
      z.object({
        query: z.string(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const results = await getPeople(input.query, input.cursor ?? 1);
      const nextPage = input.cursor ? input.cursor + 1 : 1;

      return {
        results,
        nextPage,
      };
    }),
});

export const tmdbDetailsRouter = createTRPCRouter({
  getMovie: publicProcedure
    .input(z.object({ movieId: z.string() }))
    .query(async ({ input }) => {
      return await getMovie(input.movieId);
    }),

  getPerson: publicProcedure
    .input(z.object({ personId: z.string() }))
    .query(async ({ input }) => {
      return await getPerson(input.personId);
    }),
});
