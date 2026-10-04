import Forschung from "./pageContent";

import { PLACEHOLDER_IMAGE } from "../../constants/placeholderImage";

const TITLE = "Forschung | univocal";
const DESCRIPTION =
	"Forschung zu studentischer Partizipation rund um univocal: Forschungsbeiträge mit Material zum Download und ein Open Data Hub mit Nutzungskennzahlen.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: ["univocal", "Forschung", "studentische Partizipation", "Hochschule", "Open Data", "Forschungsbeiträge"],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/forschung",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal Forschung" }],
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
	return <Forschung />;
}
