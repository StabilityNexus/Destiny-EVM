import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static HTML export

  images: {
    unoptimized: true,  // Required for static export (GitHub Pages doesn't support Next.js Image Optimization)
  },

  trailingSlash: true,  // Adds trailing slash to URLs (better for GitHub Pages)

  // If deploying to a subdirectory (e.g., username.github.io/repo-name)
  // Uncomment and update these lines:
  // basePath: '/Destiny-EVM',  // Replace with your repo name
  // assetPrefix: '/Destiny-EVM/',  // Replace with your repo name
};

export default nextConfig;
