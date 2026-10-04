export interface ResearchDownload {
	label: string;
	href: string;
	/** Shown next to the label, for example "PDF, 7 Seiten". */
	detail: string;
}

export interface ResearchContribution {
	id: string;
	type: string;
	/** APA reference, split so the title can be set in italics. */
	apa: { before: string; title: string; after: string };
	authors: { name: string; affiliation: string }[];
	summary: string;
	downloads: ResearchDownload[];
}

export const RESEARCH_CONTRIBUTIONS: ResearchContribution[] = [
	{
		id: "geneme-2026-partizipation",
		type: "Research in Progress",
		apa: {
			before: "Saukel, K. & Quintino, M. (2026, 18. September). ",
			title: "Autonome und responsive Partizipation im digitalen Raum: Neue Wege studentischer Mitgestaltung am Beispiel von univocal",
			after: " [Research in Progress]. GeNeMe 2026.",
		},
		authors: [
			{ name: "Kevin Saukel", affiliation: "Leuphana Universität Lüneburg" },
			{ name: "Marc Quintino", affiliation: "Goethe-Universität Frankfurt am Main" },
		],
		summary:
			"Wie können Studierende außerhalb der offiziellen Selbstverwaltung ihr Studium und ihre Hochschule mit digitalen Werkzeugen mitgestalten? Der Beitrag unterscheidet autonome und responsive Partizipation und untersucht mit Design-Based Implementation Research die Nutzung von univocal in einer Pilotgruppe.",
		downloads: [
			{
				label: "Beitrag",
				href: "/forschung/autonome-responsive-partizipation-univocal.pdf",
				detail: "PDF, 7 Seiten",
			},
			{
				label: "Präsentation",
				href: "/forschung/autonome-responsive-partizipation-univocal-praesentation.pdf",
				detail: "PDF, 12 Folien",
			},
		],
	},
];
