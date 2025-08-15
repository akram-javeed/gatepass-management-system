/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Fixed dev indicators - removed deprecated options
  devIndicators: {
    position: 'bottom-right',
  },
  
  // Environment variables
  env: {
    API_URL: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL 
      : 'http://localhost:5000'
  },
  
  // API rewrites for production
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
        }
      ]
    }
    return []
  },
  
  // For older Next.js versions, you might need to use webpack config
  webpack: (config, { dev, isServer }) => {
    // Modify webpack config if needed
    if (dev && !isServer) {
      // Allow connections from any IP in development
      config.devServer = {
        ...config.devServer,
        allowedHosts: 'all',
      }
    }
    return config
  },
  
  // Add CORS headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_FRONTEND_URL || '*'
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig