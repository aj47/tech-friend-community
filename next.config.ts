import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname),
  // Work around broken ESLint dependency resolution in the current install.
  // We still recommend running `npm run lint` in CI/dev once dependencies are healthy.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
