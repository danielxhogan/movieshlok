import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    console.log("inside getAll");
    return ctx.db.example.findMany();
  }),
});
