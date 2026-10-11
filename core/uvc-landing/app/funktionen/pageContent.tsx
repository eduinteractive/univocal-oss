"use client";

import { Box, Flex, Image, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { UVC_ASSETS_URL } from "@eduinteractive/uvc-api";
import { IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import "../page.css";
import UVCHero from "../../components/UVCHero";
import { LandingPageView } from "../../components/LandingStats";
import { COLORS } from "../../constants/Colors";
import classes from "./overview.module.css";

type Scene = {
	src: string;
	title: string;
	text: string;
	alt: string;
};

type Feature = {
	id: string;
	label: string;
	iconPath?: string;
	lead: string;
	scenes: Scene[];
};

const FEATURES: Feature[] = [
	{
		id: "projektmanagement",
		label: "Projektmanagement",
		iconPath: "/icons/Projektmanagement.png",
		lead: "Mit dem Projektmanagement organisiert ihr die Vorhaben der Gruppe in Projekten und Aufgaben.",
		scenes: [
			{
				src: "/funktionen/projektmanagement-uebersicht.png",
				title: "Übersicht",
				text: "In der Projektübersicht könnt ihr mehrere Projekte und Aufgaben auf einem Blick betrachten.",
				alt: "Projektübersicht mit Kennzahlen, Diagrammen und dem Fortschritt je Projekt",
			},
			{
				src: "/funktionen/projektmanagement.png",
				title: "Board",
				text: "Im Board könnt ihr Aufgaben erstellen, bestehende bearbeiten und Informationen hinterlegen, zum Beispiel Frist, zuständige Person und Beschreibung.",
				alt: "Projektboard mit den Spalten Offen, In Arbeit und Erledigt",
			},
			{
				src: "/funktionen/projektmanagement-projekte.png",
				title: "Projekte",
				text: "In der Projektliste legt ihr Projekte an. Ihr seht Titel, Beschreibung und wer das Projekt sehen darf.",
				alt: "Projektliste mit dem Projekt Erstsemesterwoche vorbereiten",
			},
			{
				src: "/funktionen/projektmanagement-aufgabe.png",
				title: "Aufgabe",
				text: "In einer Aufgabe seht ihr Titel, Beschreibung und Fälligkeitsdatum. Dazu könnt ihr Unteraufgaben anlegen.",
				alt: "Aufgabendetails mit Beschreibung, Fälligkeitsdatum und der Unteraufgabe Mikrofon reservieren",
			},
		],
	},
	{
		id: "kalender",
		label: "Kalender",
		iconPath: "/icons/Kalender.png",
		lead: "Im Kalender tragt ihr die Termine der Gruppe ein, zum Beispiel Sitzungen, Sprechstunden und Veranstaltungen.",
		scenes: [
			{
				src: "/funktionen/kalender.png",
				title: "Monat",
				text: "In der Monatsansicht seht ihr alle Termine auf einen Blick. An einem Termin hinterlegt ihr Uhrzeit, Ort und eine Beschreibung.",
				alt: "Monatskalender mit farbigen Terminen der Fachschaft",
			},
			{
				src: "/funktionen/kalender-termin.png",
				title: "Termin",
				text: "In einem Termin hinterlegt ihr Bezeichnung, Datum, Ort, Sichtbarkeit und eine Beschreibung. Den Termin könnt ihr als ICS-Datei exportieren.",
				alt: "Termindetails der Sprechstunde mit Ort Foyer und Beschreibung",
			},
		],
	},
	{
		id: "gruppenchat",
		label: "Gruppenchat",
		iconPath: "/icons/Gruppenchat.png",
		lead: "Im Gruppenchat schreibt ihr mit allen Mitgliedern der Gruppe.",
		scenes: [
			{
				src: "/funktionen/gruppenchat.png",
				title: "Verlauf",
				text: "Im Verlauf lest ihr bisherige Nachrichten und antwortet an derselben Stelle.",
				alt: "Gruppenchat mit Nachrichten mehrerer Mitglieder",
			},
		],
	},
	{
		id: "mitglieder",
		label: "Mitglieder",
		lead: "Unter Mitglieder seht ihr, wer in der Gruppe ist. Ihr ladet Personen ein, vergebt Rollen und Funktionen und entscheidet über Beitrittsanfragen.",
		scenes: [
			{
				src: "/funktionen/mitglieder.png",
				title: "Liste",
				text: "In der Liste stehen Name, Rolle und Funktion, zum Beispiel Finanzen oder Öffentlichkeit. Darunter liegen offene Einladungen und Beitrittsanfragen.",
				alt: "Mitgliederliste mit Rollen, Funktionen, einer Einladung und einer Beitrittsanfrage",
			},
		],
	},
	{
		id: "wiki",
		label: "Wiki",
		iconPath: "/icons/Wiki.png",
		lead: "Im Wiki haltet ihr Texte und Kontakte der Gruppe fest, zum Beispiel Protokolle, Leitfäden und Ansprechpartner.",
		scenes: [
			{
				src: "/funktionen/wiki-schreibweise.png",
				title: "Schreibweise",
				text: "Beim Anlegen eines Kapitels wählt ihr die Schreibweise: allein im Editor oder gleichzeitig mit anderen im Etherpad.",
				alt: "Auswahl zwischen Editor und Etherpad für ein Wiki-Kapitel",
			},
			{
				src: "/funktionen/wiki.png",
				title: "Kapitel",
				text: "In einem Kapitel schreibt und formatiert ihr den Text, zum Beispiel einen Beschluss oder eine Zuständigkeit.",
				alt: "Wiki-Kapitel Letzte Sitzung mit einem festgehaltenen Beschluss",
			},
			{
				src: "/funktionen/kontakte.png",
				title: "Kontakte",
				text: "In der Kontaktliste legt ihr Ansprechpartner an und hinterlegt Name, Telefon und Mail, zum Beispiel vom Prüfungsamt oder Dekanat.",
				alt: "Kontaktliste mit Prüfungsamt und Dekanat",
			},
		],
	},
	{
		id: "umfragen",
		label: "Umfragen",
		iconPath: "/icons/Umfragen.png",
		lead: "Mit Umfragen stellt ihr Fragen und wertet die Antworten aus.",
		scenes: [
			{
				src: "/funktionen/umfragen.png",
				title: "Fragen",
				text: "Beim Erstellen legt ihr Auswahlfragen oder offene Fragen an und bestimmt, wie lange die Umfrage läuft.",
				alt: "Umfrage mit einer Auswahlfrage und einer offenen Frage",
			},
			{
				src: "/funktionen/umfragen-uebersicht.png",
				title: "Übersicht",
				text: "In der Übersicht legt ihr Umfragen an. Ihr seht Titel, Beschreibung und wer sie sehen darf.",
				alt: "Übersicht mit drei Umfragen zur Erstsemesterwoche, zu Lernräumen und zum Wintersemester",
			},
			{
				src: "/funktionen/umfragen-durchfuehrung.png",
				title: "Durchführung",
				text: "In der Durchführung aktiviert ihr die Umfrage, teilt den Link und legt Start, Ende und den Zugangsmodus fest, zum Beispiel anonym.",
				alt: "Durchführung einer Umfrage mit Link, Zeitraum und anonymem Zugangsmodus",
			},
			{
				src: "/funktionen/umfragen-ergebnisse.png",
				title: "Ergebnisse",
				text: "In der Auswertung seht ihr, wie viele mitgemacht haben, und könnt das Ergebnis herunterladen oder für die Teilnehmenden freigeben.",
				alt: "Auswertung einer Umfrage mit drei Ergebnissen und der Freigabe zum Teilen",
			},
		],
	},
	{
		id: "events",
		label: "Events",
		iconPath: "/icons/Veranstaltungen.png",
		lead: "Mit Events organisiert ihr eine Veranstaltung: Programm, Anmeldung, Check-in und die öffentliche Seite.",
		scenes: [
			{
				src: "/funktionen/events.png",
				title: "Programm",
				text: "Im Programm legt ihr Programmpunkte an, hinterlegt Beginn, Ort und Beschreibung und ändert die Reihenfolge.",
				alt: "Programm einer Veranstaltung mit drei Programmpunkten",
			},
			{
				src: "/funktionen/events-beschreibung.png",
				title: "Beschreibung",
				text: "In der Beschreibung legt ihr Titel, Text, Sichtbarkeit sowie Start und Ende fest.",
				alt: "Beschreibung der Begrüßung der Erstsemester mit Zeitraum",
			},
			{
				src: "/funktionen/events-anmeldungen.png",
				title: "Anmeldungen",
				text: "Bei der Anmeldung legt ihr die Platzzahl fest und fragt weitere Angaben ab, zum Beispiel Studiengang oder Verpflegung.",
				alt: "Anmeldeeinstellungen mit 80 Plätzen und zusätzlichen Formularfeldern",
			},
			{
				src: "/funktionen/events-checkin.png",
				title: "Check-in",
				text: "Beim Check-in seht ihr, wer sich angemeldet hat, und markiert, wer gekommen ist.",
				alt: "Check-in-Liste mit erfassten Personen",
			},
			{
				src: "/funktionen/events-oeffentlich.png",
				title: "Öffentliche Seite",
				text: "Auf der öffentlichen Seite stehen Datum, Ort, Ablauf und der Weg zur Anmeldung.",
				alt: "Öffentliche Veranstaltungsseite mit Ablauf und Anmeldebutton",
			},
			{
				src: "/funktionen/events-module.png",
				title: "Module",
				text: "In den Einstellungen schaltet ihr Programm, Anmeldung und Check-in einzeln ein und veröffentlicht die Seite.",
				alt: "Module Programm, Anmeldung und Check-in mit Schalter zum Veröffentlichen",
			},
		],
	},
	{
		id: "finanzen",
		label: "Finanzen",
		iconPath: "/icons/Finanzen.png",
		lead: "In den Finanzen stellt ihr einen Haushaltsplan auf und hinterlegt Belege zu den Ausgaben.",
		scenes: [
			{
				src: "/funktionen/finanzen.png",
				title: "Haushaltsplan",
				text: "Im Haushaltsplan legt ihr Einnahmen und Ausgaben als Positionen an, zum Beispiel Semesterbeitrag oder Erstsemesterwoche, und seht Soll und Ist.",
				alt: "Haushaltsplan mit Einnahmen, Ausgaben und Gesamtsumme",
			},
			{
				src: "/funktionen/finanzen-belege.png",
				title: "Belege",
				text: "An einer Ausgabe hinterlegt ihr Betrag, Datum, Zweck und die Quittung als Datei.",
				alt: "Belegliste mit einem Beleg über 186 Euro für die Erstsemesterwoche",
			},
		],
	},
	{
		id: "webpraesenz",
		label: "Webpräsenz",
		iconPath: "/icons/Webpraesenz.png",
		lead: "Mit der Webpräsenz veröffentlicht ihr eine eigene Seite der Gruppe.",
		scenes: [
			{
				src: "/funktionen/webpraesenz.png",
				title: "Öffentliche Seite",
				text: "Auf der öffentlichen Seite stehen Vorstellung, Schwarzes Brett, Events und Umfragen.",
				alt: "Öffentliche Seite der Fachschaft Informatik mit Schwarzem Brett",
			},
			{
				src: "/funktionen/webpraesenz-profil.png",
				title: "Gruppenprofil",
				text: "Im Gruppenprofil legt ihr fest, welche Abschnitte auf der Startseite stehen und in welcher Reihenfolge, und seht eine Vorschau.",
				alt: "Gruppenprofil mit Live-Vorschau und den Abschnitten der Startseite",
			},
			{
				src: "/funktionen/webpraesenz-brett.png",
				title: "Schwarzes Brett",
				text: "Im Schwarzen Brett wählt ihr, welche Neuigkeiten und Projekte auf der Startseite stehen. Entwürfe bleiben unveröffentlicht.",
				alt: "Schwarzes Brett mit veröffentlichten Einträgen und einem Entwurf",
			},
		],
	},
];

const ICON_FRAME = {
	width: "min(100%, 7rem)",
	aspectRatio: "1",
	flexShrink: 0,
} as const;

const FeatureMark = ({ feature, size }: { feature: Feature; size: number }) => {
	if (!feature.iconPath) {
		return (
			<Box
				bg={COLORS.SECONDARY}
				w="100%"
				h="100%"
				style={{
					borderRadius: "0.85rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<IconUsers
					size={size}
					color={COLORS.PRIMARY}
					stroke={1.5}
				/>
			</Box>
		);
	}
	return (
		<Image
			src={UVC_ASSETS_URL + feature.iconPath}
			alt=""
			w="100%"
			h="100%"
			fit="contain"
		/>
	);
};

const AUDIENCE_LINKS = [
	{
		href: "/funktionen/fachschaften",
		title: "Für Fachschaften",
		text: "Events, Finanzen, Wiki und die eigene Webpräsenz für die Fachschaft",
	},
	{
		href: "/funktionen/asten",
		title: "Für ASten",
		text: "Referate, Haushalt und Stimmungsbilder für die Studierendenschaft",
	},
	{
		href: "/funktionen/gremien",
		title: "Für Gremien und Ausschüsse",
		text: "Sitzungen, Beschlüsse und Termine für die akademische Selbstverwaltung",
	},
];

const SceneShot = ({ scene, primary = false }: { scene: Scene; primary?: boolean }) => (
	<figure className={primary ? `${classes.card} ${classes.primary}` : classes.card}>
		<div className={classes.shell}>
			<div className={classes.core}>
				<Image
					className={primary ? `${classes.shot} ${classes.shotPrimary}` : classes.shot}
					src={scene.src}
					alt={scene.alt}
				/>
			</div>
		</div>
		<figcaption>
			<Title
				order={3}
				className={classes.captionTitle}
			>
				{scene.title}
			</Title>
			<Text className={classes.captionText}>{scene.text}</Text>
		</figcaption>
	</figure>
);

const Funktionen = () => {
	const theme = useMantineTheme();
	const g = theme.spacing.md;
	const tileWidth = {
		base: `calc((100% - ${g}) / 2)`,
		sm: `calc((100% - ${g} * 3) / 4)`,
		lg: `calc((100% - ${g} * 7) / 8)`,
	} as const;

	return (
		<>
			<LandingPageView path="/funktionen" />
			<UVCHero
				title="Funktionen"
				titleOrder={1}
				content="Hier seht ihr, was ihr mit jedem Werkzeug machen könnt: Aufgaben planen, Termine eintragen, schreiben, Wissen festhalten, Umfragen auswerten, Veranstaltungen organisieren, den Haushalt führen und eine eigene Seite veröffentlichen."
				justify="center"
			/>

			<Box
				data-landing-section="werkzeuge"
				bg={COLORS.SECONDARY}
				px={{ base: "md", sm: "xl" }}
				pb={{ base: "3rem", sm: "4rem" }}
				mt={-50}
			>
				<Flex
					gap="md"
					w="100%"
					maw={1120}
					mx="auto"
					wrap="wrap"
					justify="center"
				>
					{FEATURES.filter((feature) => feature.iconPath).map((feature) => (
						<Box
							key={feature.id}
							component={Link}
							href={`#${feature.id}`}
							flex="0 0 auto"
							w={tileWidth}
							style={{ textDecoration: "none" }}
						>
							<Stack
								gap={0}
								align="center"
								my="sm"
							>
								<Box
									mb="sm"
									w="100%"
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Box
										className="uvc-tool-icon"
										style={{
											...ICON_FRAME,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<FeatureMark
											feature={feature}
											size={72}
										/>
									</Box>
								</Box>
								<Text
									c={COLORS.TEXT}
									fw="bold"
									fz="sm"
									ta="center"
									lh={1.25}
								>
									{feature.label}
								</Text>
							</Stack>
						</Box>
					))}
				</Flex>
			</Box>

			<Box
				component="section"
				bg="white"
				py={{ base: "4rem", sm: "6rem" }}
				px={{ base: "md", sm: "xl" }}
			>
				<div style={{ maxWidth: 1120, marginInline: "auto" }}>
					{FEATURES.map((feature) => {
						const [first, ...rest] = feature.scenes;
						return (
							<article
								key={feature.id}
								id={feature.id}
								className={classes.feature}
							>
								<header className={classes.masthead}>
									<div className={classes.mark}>
										<FeatureMark
											feature={feature}
											size={40}
										/>
									</div>
									<Title
										order={2}
										c={COLORS.PRIMARY}
										fw={800}
										mt="md"
										style={{ letterSpacing: "-0.03em" }}
									>
										{feature.label}
									</Title>
									<Text
										className={classes.lead}
										mt="sm"
										c={COLORS.TEXT}
										lh={1.65}
									>
										{feature.lead}
									</Text>
								</header>
								<div className={classes.gallery}>
									<SceneShot
										scene={first}
										primary
									/>
									{rest.length > 0 && (
										<div className={classes.grid}>
											{rest.map((scene) => (
												<SceneShot
													key={scene.src}
													scene={scene}
												/>
											))}
										</div>
									)}
								</div>
							</article>
						);
					})}
				</div>
			</Box>
		</>
	);
};

export default Funktionen;
