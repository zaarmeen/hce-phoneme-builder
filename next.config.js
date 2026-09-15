/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a minimal, self-contained server (server.js + only the deps it needs)
  // in .next/standalone — this is what the Dockerfile copies into the final image.
  output: "standalone",
};

module.exports = nextConfig;
