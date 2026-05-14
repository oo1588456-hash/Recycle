/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8005", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8005", pathname: "/media/**" },
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3000", pathname: "/media/**" },
    ],
  },
  async rewrites() {
    const django = process.env.BACKEND_ORIGIN || "http://127.0.0.1:8005";
    return [
      { source: "/api/v1/:path*", destination: `${django}/api/v1/:path*` },
      { source: "/media/:path*", destination: `${django}/media/:path*` },
    ];
  },
};

export default nextConfig;
