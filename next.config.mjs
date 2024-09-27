/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.producthunt.com",
        port: "",
        pathname: "/widgets/embed-image/v1/**"
      }
    ]
  }
}

export default nextConfig
