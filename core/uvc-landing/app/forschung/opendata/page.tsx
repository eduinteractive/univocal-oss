import OpenDataHub from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

const TITLE = "Open Data Hub | univocal";
const DESCRIPTION =
	"Offene, aggregierte Nutzungsstatistiken und Kennzahlen zu univocal. Die ersten Datensätze sind bald verfügbar.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: ["univocal", "Open Data", "Nutzungsstatistiken", "Kennzahlen", "Forschung", "Hochschule"],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/forschung/opendata",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal Open Data Hub" }],
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
	return <OpenDataHub />;
}
