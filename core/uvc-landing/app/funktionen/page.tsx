import Funktionen from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../constants/placeholderImage";

const DESCRIPTION =
	"Univocal für Fachschaften, ASten sowie Gremien und Ausschüsse: Projektmanagement, Kalender, Gruppenchat, Wiki, Umfragen, Events und Finanzen – mit Use Cases zu Fachschaftsfahrt, Onboarding, Haushaltsführung, Stimmungsbildern, Terminkoordination und mehr. Inklusive SSO via Shibboleth und DSGVO-konform.";

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
		"Fachschaftsfahrt",
		"Onboarding",
		"AStA",
		"Haushaltsführung",
		"Stimmungsbilder",
		"Terminkoordination",
		"Gremien",
		"Ausschüsse",
		"Personalrat",
		"Tagungsorganisation",
		"SSO",
		"Shibboleth",
		"DSGVO",
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
