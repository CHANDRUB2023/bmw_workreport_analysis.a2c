/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./data/**/*']
  }
};

export default nextConfig;
