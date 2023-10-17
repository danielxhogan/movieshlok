import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server";

const api = createTRPCReact<AppRouter>({});

export default api;
