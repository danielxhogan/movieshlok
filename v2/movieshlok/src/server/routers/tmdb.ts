import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { getMovies, getPeople } from "@/tmdb/search";
import { z } from "zod";

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
