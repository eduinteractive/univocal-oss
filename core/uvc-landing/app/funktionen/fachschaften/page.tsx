import Fachschaften from "./pageContent";
import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

const TITLE = "Für Fachschaften | univocal";
const DESCRIPTION =
	"Univocal für Fachschaften: Events, Finanzen, Wiki, Projektboard, Gruppenchat und die eigene Webpräsenz.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: ["univocal", "Fachschaft", "Funktionen", "Events", "Wiki", "Finanzen", "Webpräsenz"],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/funktionen/fachschaften",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal für Fachschaften" }],
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
	return <Fachschaften />;
}
