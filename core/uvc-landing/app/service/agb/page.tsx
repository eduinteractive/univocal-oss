import AGB from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

export const metadata = {
	title: "AGB | univocal: Allgemeine Geschäftsbedingungen",
	description:
		"Hier findest du die aktuellen Allgemeinen Geschäftsbedingungen (AGB) von univocal. Informiere dich über die rechtlichen Grundlagen unserer Plattform und Services.",
	keywords: [
		"univocal",
		"AGB",
		"Allgemeine Geschäftsbedingungen",
		"Nutzungsbedingungen",
		"Rechtliche Hinweise",
		"univocal Nutzungsregeln",
		"Vertragsbedingungen",
		"univocal Rechtliches",
		"Hochschule AGB",
		"Bildungsplattform Bedingungen",
	],
	openGraph: {
		title: "AGB | univocal: Allgemeine Geschäftsbedingungen",
		description:
			"Detaillierte Informationen zu den Allgemeinen Geschäftsbedingungen (AGB) von univocal findest du auf dieser Seite.",
		url: "https://univocal.de/service/agb",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal Logo, AGB",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "AGB | univocal",
		description:
			"Hier findest du die Allgemeinen Geschäftsbedingungen (AGB) von univocal.",
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <AGB />;
}
