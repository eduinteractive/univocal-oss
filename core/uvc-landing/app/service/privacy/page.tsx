import Privacy from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

export const metadata = {
	title: "Datenschutzerklärung | univocal",
	description:
		"In der Datenschutzerklärung von univocal erfährst du, wie wir personenbezogene Daten verarbeiten und welche Datenschutzstandards wir einhalten (konform zur DSGVO).",
	keywords: [
		"univocal",
		"Datenschutzerklärung",
		"DSGVO Bildungsplattform",
		"Datenschutz univocal",
		"Personenbezogene Daten",
		"Rechtliche Hinweise Datenschutz",
		"Datenverarbeitung univocal",
		"ISO 27001 Rechenzentren",
		"Nutzerrechte Datenschutz",
		"Bildungsplattform Datenschutz",
	],
	openGraph: {
		title: "Datenschutzerklärung | univocal",
		description:
			"Hier findest du alle Informationen zum Datenschutz bei univocal und zur Verarbeitung personenbezogener Daten gemäß DSGVO.",
		url: "https://univocal.de/service/privacy",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal Logo, Datenschutz",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Datenschutzerklärung | univocal",
		description:
			"Erfahre alles über den Umgang mit personenbezogenen Daten bei univocal, vollständig DSGVO-konform.",
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <Privacy />;
}
