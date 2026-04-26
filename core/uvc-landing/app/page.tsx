import type { Metadata } from "next";
import { PLACEHOLDER_IMAGE } from "../constants/placeholderImage";
import HomePage from "./pageContent";

export const metadata: Metadata = {
	title: "univocal: Weil jede Meinung zählt",
	alternates: {
		canonical: "/",
	},
	description:
		"univocal ist die zentrale Plattform für Fachschaften, Hochschulgruppen und Gremien: Zusammenarbeit, Kommunikation und studentische Mitbestimmung – Open Source, datensouverän und transparent.",
	keywords: [
		"univocal",
		"Universität",
		"Hochschule",
		"Fachschaft",
		"Hochschulgruppe",
		"Gremien",
		"Mitbestimmung",
		"Open Source",
		"Datensouveränität",
		"Projektmanagement",
		"Gruppenchat",
		"Wiki",
		"Umfragen",
		"Veranstaltungen",
	],
	openGraph: {
		title: "univocal: Weil jede Meinung zählt",
		description:
			"Die zentrale Plattform für Fachschaften, Hochschulgruppen und Gremien: Zusammenarbeit, Kommunikation und studentische Mitbestimmung – Open Source, datensouverän und transparent.",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "univocal: Weil jede Meinung zählt",
		description:
			"Für Fachschaften, Hochschulgruppen und Gremien: Zusammenarbeit, Kommunikation und studentische Mitbestimmung – Open Source und datensouverän.",
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <HomePage />;
}
