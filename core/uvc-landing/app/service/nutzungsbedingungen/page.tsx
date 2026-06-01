import TermsOfUse from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

export const metadata = {
	title: "Nutzungsbedingungen | univocal",
	description:
		"Community-Richtlinie und Nutzungsbedingungen von univocal zur Förderung der Gremienarbeit in Universitäten – Regeln für respektvollen Umgang, Datenschutz und sichere Nutzung der Plattform.",
	keywords: [
		"univocal",
		"Nutzungsbedingungen",
		"Community-Richtlinie",
		"Nutzungsregeln",
		"Gremienarbeit",
		"Universität",
		"Hochschule",
		"Plattform Richtlinien",
	],
	openGraph: {
		title: "Nutzungsbedingungen | univocal",
		description:
			"Community-Richtlinie und Nutzungsbedingungen von univocal.",
		url: "https://univocal.de/service/nutzungsbedingungen",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal Logo, Nutzungsbedingungen",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Nutzungsbedingungen | univocal",
		description:
			"Community-Richtlinie und Nutzungsbedingungen von univocal.",
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <TermsOfUse />;
}
