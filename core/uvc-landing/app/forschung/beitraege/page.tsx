import Forschungsbeitraege from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

const TITLE = "Forschungsbeiträge | univocal";
const DESCRIPTION =
	"Forschungsbeiträge zu univocal und studentischer Partizipation mit Zitation im APA-Stil sowie Beitrag und Präsentation zum Download.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: [
		"univocal",
		"Forschungsbeiträge",
		"GeNeMe 2026",
		"studentische Partizipation",
		"Design-Based Implementation Research",
		"Hochschule",
	],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/forschung/beitraege",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal Forschungsbeiträge" }],
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
	return <Forschungsbeitraege />;
}
