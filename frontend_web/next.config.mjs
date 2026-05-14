/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8005", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8005", pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
