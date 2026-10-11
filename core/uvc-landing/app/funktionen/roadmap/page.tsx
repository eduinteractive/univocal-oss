import Roadmap from "./pageContent";
import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

const TITLE = "Roadmap | univocal";
const DESCRIPTION =
	"Roadmap von univocal: Jetzt, als Nächstes und später.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: ["univocal", "Roadmap", "Netzwerk", "Veranstaltungen", "Projektmanagement", "Umfragen", "Check-in"],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/funktionen/roadmap",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal Roadmap" }],
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
	return <Roadmap />;
}
