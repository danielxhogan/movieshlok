import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [
    // pages
    "/",
    "/search",
    "/u(.*)",

    "/test1",
    "/test2",
    "/test3",

    // endopoints
    "/api/trpc/example.hello",
    "/api/trpc/example.getAll",
    "/api/new-user",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
