import { appRouter } from "@/server";
import { db } from "@/server/db";

export const api = appRouter.createCaller({ db });
