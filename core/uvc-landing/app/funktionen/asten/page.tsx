import Asten from "./pageContent";
import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

const TITLE = "Für ASten | univocal";
const DESCRIPTION =
	"Univocal für ASten: Haushalt, Stimmungsbilder, Terminkoordination und SSO für die Studierendenschaft.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: ["univocal", "AStA", "Funktionen", "Haushalt", "Umfragen", "Kalender", "SSO"],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/funktionen/asten",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal für ASten" }],
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
	return <Asten />;
}
