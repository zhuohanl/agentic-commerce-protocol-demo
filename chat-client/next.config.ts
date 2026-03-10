import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Expose AZURE_DEPLOYMENT_NAME to the client bundle under the NEXT_PUBLIC_ prefix
    NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME: process.env.AZURE_DEPLOYMENT_NAME,
  },
};

export default nextConfig;
