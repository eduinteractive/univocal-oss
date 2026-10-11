import Gremien from "./pageContent";
import { PLACEHOLDER_IMAGE } from "../../../constants/placeholderImage";

const TITLE = "Für Gremien und Ausschüsse | univocal";
const DESCRIPTION =
	"Univocal für Gremien und Ausschüsse: Projektarbeit, Wiki, Umfragen, Kalender und SSO für vertrauliche Unterlagen.";

export const metadata = {
	title: TITLE,
	description: DESCRIPTION,
	keywords: ["univocal", "Gremien", "Ausschüsse", "Funktionen", "Wiki", "Personalrat", "Tagung"],
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		url: "https://univocal.de/funktionen/gremien",
		siteName: "univocal",
		images: [{ url: PLACEHOLDER_IMAGE, width: 1200, height: 630, alt: "univocal für Gremien und Ausschüsse" }],
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
	return <Gremien />;
}
