import Funktionen from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../constants/placeholderImage";

const DESCRIPTION =
	"Was Fachschaften, ASten und Gremien mit univocal im Alltag schaffen: Aufgaben, Termine, Absprachen, Wissen, Umfragen, Veranstaltungen, Haushalt und die eigene Seite.";

export const metadata = {
	title: "Funktionen | univocal – Für Fachschaften, ASten und Gremien",
	description: DESCRIPTION,
	keywords: [
		"univocal",
		"Funktionen",
		"Projektmanagement",
		"Kalender",
		"Gruppenchat",
		"Wiki",
		"Umfragen",
		"Events",
		"Finanzen",
		"Fachschaft",
		"AStA",
		"Haushaltsführung",
		"Gremien",
		"Ausschüsse",
		"studentische Selbstverwaltung",
	],
	openGraph: {
		title: "Funktionen | univocal – Für Fachschaften, ASten und Gremien",
		description: DESCRIPTION,
		url: "https://univocal.de/funktionen",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal Funktionen für Fachschaften, ASten und Gremien",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Funktionen | univocal – Für Fachschaften, ASten und Gremien",
		description: DESCRIPTION,
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <Funktionen />;
}
