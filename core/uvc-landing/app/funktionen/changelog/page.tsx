import Changelog from "./pageContent";
import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

const TITLE = "Changelog | univocal";
const DESCRIPTION =
	"Neu in univocal 1.1.1 und 1.1.0: modulare Veranstaltungen, Kalender, Aufgaben, Umfragen, Wiki, Mitgliederfunktionen, öffentliche Gruppenprofile, Belege und der Bereich Forschung.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: ["univocal", "Changelog", "Version 1.1.1", "Version 1.1.0", "Gruppenprofil", "Forschung", "Kalender", "Umfragen"],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/funktionen/changelog",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal Changelog" }],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: DESCRIPTION,
		images: [PLACEHOLDER_IMAGE],
	},
};

export default function Page() {
	return <Changelog />;
}
