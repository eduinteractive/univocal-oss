"use client";

import {
	Accordion,
	Box,
	Container,
	Divider,
	Flex,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { IconQuestionMark } from "@tabler/icons-react";
import { COLORS } from "../../constants/Colors";

const faqData = [
	{
		title: "univocal & SV-Hub",
		qa: [
			{
				question: "Was ist univocal?",
				answer:
					"univocal richtet sich an Hochschulgruppen wie Fachschaften, Initiativen, Netzwerke und Gremien. Vernetzung, Zusammenarbeit und Organisation laufen an einem Ort zusammen: Projekte, Termine, Austausch und Dokumentation hängen zusammen, statt über mehrere getrennte Tools verteilt zu sein.",
			},
			{
				question: "Welche Beziehung hat univocal zum SV-Hub?",
				answer:
					"Der SV-Hub ist eine Open-Source-Plattform für demokratische Mitbestimmung an Schulen (siehe die Projektbeschreibung im öffentlichen Repository). univocal nutzt dieselbe Codebasis, ist aber als Fork auf Universitäten und Hochschularbeit ausgerichtet, nicht auf den Schulalltag.",
			},
			{
				question: "Für wen ist univocal gedacht?",
				answer:
					"Für alle, die an der Hochschule mitgestalten und nicht nur in verstreuten Gruppenchats untergehen wollen: Fachschaft, Referat, Netzwerk, was auch immer. Wenn ihr einen festen Ort für Absprachen und Aufgaben braucht, passt das.",
			},
		],
	},
	{
		title: "Funktionen",
		qa: [
			{
				question: "Welche Funktionen bietet univocal?",
				answer:
					"Im Kern das, was Gremien brauchen: Projektmanagement, Kalender, Chat, Wiki, Umfragen, Veranstaltungen, Finanzen (je nach Ausbaustand kann der Umfang variieren). Die Idee ist, alles in einer Oberfläche zu haben, statt zwischen vielen Einzelapps zu springen.",
			},
			{
				question: "Ist univocal dasselbe wie der SV-Hub?",
				answer:
					"Nein. univocal ist eine eigenständige Ausrichtung auf Hochschulen. Technisch knüpft sie an den SV-Hub an. Inhalte, Texte und einige Anpassungen richten sich an Fachschaften und universitäre Kontexte.",
			},
		],
	},
	{
		title: "Nutzung & Bereitstellung",
		qa: [
			{
				question: "Ist univocal Open Source?",
				answer:
					"Auf der Startseite verlinken wir ein öffentliches Repository auf GitHub. Lizenz, Quellcode und Hinweise zu Builds und Mitwirkung stehen dort. Wenn etwas fehlt, meldet euch gern im Issue-Tracker.",
			},
			{
				question: "Kann ich univocal selbst hosten?",
				answer:
					"Ja. Du kannst die Software auf eigener Infrastruktur betreiben und an deine Hochschule anpassen. Technische Voraussetzungen und Setup stehen im Repository und in der Dokumentation dort.",
			},
			{
				question: "Gibt es ein gehostetes Angebot (SaaS)?",
				answer:
					"Wenn ihr nicht selbst hosten wollt, könnt ihr auf der Startseite ein gehostetes SaaS-Angebot anfragen, etwa wenn Betrieb und Support aus einer Hand kommen sollen. Konkrete Konditionen klären wir im Gespräch.",
			},
		],
	},
	{
		title: "Technik & Datenschutz",
		qa: [
			{
				question: "Wo liegen meine Daten bei Self-Hosting?",
				answer:
					"Beim Betrieb auf eigener Infrastruktur bestimmt eure Hochschule bzw. euer Team, wo Daten gespeichert werden und wie Backups und Zugriffe geregelt sind. Ihr solltet das mit eurer IT und ggf. Datenschutzbeauftragten abstimmen.",
			},
			{
				question: "Wie sieht Datenschutz beim SaaS-Angebot aus?",
				answer:
					"Beim gehosteten univocal läuft die Plattform in der IONOS Cloud. Die Rechenzentren von IONOS sind nach ISO/IEC 27001 zertifiziert (Informationssicherheits-Management). Vertrag und Auftragsverarbeitung nach Art. 28 DSGVO klären wir mit eurer Hochschule. Einzelheiten zur Verarbeitung stehen in der Datenschutzerklärung.",
			},
			{
				question: "Wie wird mit Datenschutz umgegangen?",
				answer:
					"univocal wird von Organisationen genutzt, die personenbezogene Daten verarbeiten. Was konkret passiert, hängt von Konfiguration, Hosting und Nutzung ab. Beim SaaS-Angebot gelten die Hinweise zur IONOS Cloud und zur Auftragsverarbeitung. Beim Self-Hosting liegt die Verantwortung bei euch.",
			},
		],
	},
	{
		title: "Support",
		qa: [
			{
				question: "Wo erhalte ich Hilfe oder kann Feedback geben?",
				answer:
					"Nutzt dafür die Kontaktmöglichkeiten, die auf dieser Website oder im Repository genannt werden (z. B. Issues im Repository oder die im Impressum angegebene E-Mail). Für Angebote zur Nutzung an der Universität nutzt ihr die Anfrage auf der Startseite.",
			},
		],
	},
];

const FAQ = () => {
	return (
		<Container size="lg">
			<Flex
				direction="column"
				gap="sm"
				justify="center"
				mt="xl"
				align="center"
				mb="xl"
			>
				<ThemeIcon
					variant="light"
					size={60}
					radius={60}
					style={{ color: COLORS.PRIMARY }}
				>
					<IconQuestionMark size={34} />
				</ThemeIcon>
				<Title order={2} ta="center" c={COLORS.PRIMARY}>
					Häufige Fragen (FAQ)
				</Title>
				<Title order={5} ta="center" c="dimmed" fw={500}>
					Antworten zu univocal, Funktionen, Bereitstellung und Datenschutz
				</Title>
				<Divider my="sm" w="100%" />
				{faqData.map((section, sectionIndex) => (
					<Box key={section.title} w="100%">
						<Title
							order={4}
							mt={sectionIndex === 0 ? "xs" : 50}
							c={COLORS.PRIMARY}
						>
							{section.title}
						</Title>
						<Accordion multiple w="100%" variant="contained">
							{section.qa.map((qa, qaIndex) => (
								<Accordion.Item
									key={`${section.title}-${qaIndex}`}
									value={`${section.title}-${qaIndex}`}
								>
									<Accordion.Control>{qa.question}</Accordion.Control>
									<Accordion.Panel>{qa.answer}</Accordion.Panel>
								</Accordion.Item>
							))}
						</Accordion>
					</Box>
				))}
			</Flex>
		</Container>
	);
};

export default FAQ;
