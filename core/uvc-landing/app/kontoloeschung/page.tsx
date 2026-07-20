import AccountDeletion from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../constants/placeholderImage";

export const metadata = {
	title: "Kontolöschung | univocal",
	description:
		"Fordere die Löschung deines univocal-Kontos an. Alle persönlichen Daten und Einstellungen werden dauerhaft entfernt.",
	keywords: [
		"univocal",
		"Kontolöschung",
		"Konto löschen",
		"Account löschen",
		"Daten löschen",
	],
	openGraph: {
		title: "Kontolöschung | univocal",
		description:
			"Fordere die Löschung deines univocal-Kontos an.",
		url: "https://univocal.de/kontoloeschung",
		siteName: "univocal",
		images: [
			{
				url: PLACEHOLDER_IMAGE,
				width: 1200,
				height: 630,
				alt: "univocal Logo, Kontolöschung",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Kontolöschung | univocal",
		description:
			"Fordere die Löschung deines univocal-Kontos an.",
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <AccountDeletion />;
}
