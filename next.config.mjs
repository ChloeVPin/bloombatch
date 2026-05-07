/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export lets Tauri bundle the app as a self-contained binary.
  // `next dev` ignores this setting so the dev workflow is unchanged.
  output: 'export',
  experimental: {
    workerThreads: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
