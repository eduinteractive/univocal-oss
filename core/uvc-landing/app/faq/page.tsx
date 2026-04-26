import FAQ from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../constants/placeholderImage";

export const metadata = {
	title: "FAQ | univocal: Häufige Fragen zur Hochschul-Plattform",
	description:
		"Antworten zu univocal: Plattform für Fachschaften und Hochschulgruppen, Bezug zum SV-Hub, Funktionen, Open Source, Self-Hosting, SaaS und Datenschutz.",
	keywords: [
		"univocal",
		"FAQ",
		"SV-Hub",
		"Hochschule",
		"Fachschaft",
		"Open Source",
		"Self-Hosting",
	],
	openGraph: {
		title: "FAQ | univocal",
		description:
			"Häufige Fragen zu univocal: Zielgruppe, Funktionen, Open Source, Hosting und Datenschutz.",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal FAQ",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "FAQ | univocal",
		description:
			"Fragen und Antworten zur Plattform univocal für Vernetzung und Zusammenarbeit an Hochschulen.",
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <FAQ />;
}
