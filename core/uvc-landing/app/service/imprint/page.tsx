import Imprint from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

export const metadata = {
	title: "Impressum | univocal",
	description:
		"Hier findest du das vollständige Impressum von univocal mit allen relevanten Angaben gemäß §5 TMG und weiteren rechtlichen Hinweisen.",
	keywords: [
		"univocal",
		"Impressum",
		"Kontaktinformationen",
		"Anbieterkennzeichnung",
		"TMG Angaben",
		"Bildungsplattform Impressum",
		"univocal rechtliche Angaben",
		"Verantwortliche Stelle",
		"Rechtliche Hinweise",
		"Impressum Bildungsplattform",
	],
	openGraph: {
		title: "Impressum | univocal",
		description:
			"Offizielle Kontakt- und Anbieterdaten von univocal: vollständiges Impressum gemäß §5 TMG.",
		url: "https://univocal.de/service/imprint",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal Logo, Impressum",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Impressum | univocal",
		description:
			"Hier findest du alle rechtlichen Kontaktinformationen und Angaben zu univocal.",
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <Imprint />;
}
