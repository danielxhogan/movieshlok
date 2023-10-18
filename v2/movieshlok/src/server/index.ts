import { userRouter } from "@/server/routers/user";
import { tmdbSearchRouter } from "./routers/tmdb";
import { createTRPCRouter } from "@/server/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  tmdbSearch: tmdbSearchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
