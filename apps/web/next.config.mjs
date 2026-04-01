/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  turbopack:{
    root:"../../"
  }
}

export default nextConfig
