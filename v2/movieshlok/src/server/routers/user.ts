import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { type RouterOutputs } from "@/api/types";

import { z } from "zod";
import { TRPCError } from "@trpc/server";

export type UserType = RouterOutputs["user"]["getUser"];

export const userRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: { clerkId: input.clerkId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `failed to find user with clerkId ${input.clerkId}.`,
        });
      }

      return user;
    }),
});
