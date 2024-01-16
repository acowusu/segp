/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(wav)$/i,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'static/media/', // The directory where the files will be copied to
        publicPath: '/_next/static/media/', // The public URL path to access the files
      },
    });
    return config;
  }, };

module.exports = nextConfig
