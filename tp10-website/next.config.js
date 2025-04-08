/** @type {import('next').NextConfig} */
module.exports = {
    images: {
        unoptimized: true, // Disable Next.js image optimization
    },
    // Force disable browser caching for images
    async headers() {
        return [
            {
                source: '/:path*.(jpg|jpeg|png)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, max-age=0',
                    },
                ],
            },
        ];
    },
};