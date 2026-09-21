import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // This app sits inside the package, which sits inside the club site. Pin
  // the tracing root so Next stops reaching for the outer lockfile.
  outputFileTracingRoot: __dirname,
  // The package ships TypeScript source, exactly as a real consumer receives it.
  transpilePackages: ['@entry-place/calendar'],
}

export default nextConfig
