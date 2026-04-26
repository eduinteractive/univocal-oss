import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/turl/', '/eurl/'],
        },
        sitemap: 'https://univocal.de/sitemap.xml',
    }
}