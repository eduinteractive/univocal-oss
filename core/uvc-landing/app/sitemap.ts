import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: "https://univocal.de",
			lastModified: new Date("2025-04-04"),
			changeFrequency: "yearly",
			priority: 1,
		},
		{
			url: "https://univocal.de/faq",
			lastModified: new Date("2025-04-04"),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: "https://univocal.de/service/agb",
			lastModified: new Date("2025-04-04"),
			changeFrequency: "monthly",
			priority: 0.2,
		},
		{
			url: "https://univocal.de/service/imprint",
			lastModified: new Date("2025-04-04"),
			changeFrequency: "monthly",
			priority: 0.2,
		},
		{
			url: "https://univocal.de/service/privacy",
			lastModified: new Date("2025-04-04"),
			changeFrequency: "monthly",
			priority: 0.2,
		},
		{
			url: "https://univocal.de/kontoloeschung",
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: "https://univocal.de/service/nutzungsbedingungen",
			lastModified: new Date("2025-09-10"),
			changeFrequency: "yearly",
			priority: 0.4,
		},
	];
}
