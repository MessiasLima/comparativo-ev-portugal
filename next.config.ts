import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // GitHub Pages can only serve static files; PPR/Cache Components stay enabled
  // for the normal development and server build, but are disabled for export.
  ...(isGitHubPagesBuild
    ? {
        output: "export" as const,
        basePath: basePath || undefined,
        trailingSlash: true,
        cacheComponents: false,
        partialPrefetching: false,
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
