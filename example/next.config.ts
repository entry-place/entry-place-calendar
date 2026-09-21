import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // This app sits inside the package, which has its own lockfile one level
  // up. Pin the tracing root so Next stops treating the package as the
  // workspace root.
  outputFileTracingRoot: __dirname,
  // The package ships TypeScript source, exactly as a real consumer receives it.
  transpilePackages: ['@entry-place/calendar'],
}

export default nextConfig
