import { appRouter } from "@/server";
import { db } from "@/server/db";

const api = appRouter.createCaller({ db });
export default api;
