/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to reduce double-mount issues with some wallet extensions
  transpilePackages: [
    '@rainbow-me/rainbowkit', 
    'wagmi', 
    '@vanilla-extract/css', 
    '@vanilla-extract/sprinkles'
  ],
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      "bufferutil": "commonjs bufferutil"
    })
    return config
  },
}

module.exports = nextConfig
