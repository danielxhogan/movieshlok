/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/w45/*"
      },
      // poster sizes
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/w92/*"
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/w154/*"
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/w185/*"
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/w342/*"
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/w780/*"
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
