/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pixabay.com', 'api.dicebear.com', 'ggopgsjaouopeccqdomq.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pixabay.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig