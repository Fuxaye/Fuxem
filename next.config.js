/** @type {import('next').NextConfig} */
const defaultAllowedDevOrigins = ['localhost', '127.0.0.1', '38.172.236.3']
const extraAllowedDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const allowedDevOrigins = Array.from(new Set([...defaultAllowedDevOrigins, ...extraAllowedDevOrigins]))

const nextConfig = {
  allowedDevOrigins,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
