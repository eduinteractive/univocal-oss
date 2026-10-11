"use client";

import { Box, Group, Image, Text, Title } from "@mantine/core";
import { UVC_ASSETS_URL } from "@eduinteractive/uvc-api";
import UVCHero from "../../../components/UVCHero";
import { LandingPageView } from "../../../components/LandingStats";
import { COLORS } from "../../../constants/Colors";
import classes from "./changelog.module.css";

type Change = {
	title: string;
	text: string;
	icon?: string;
	featured?: boolean;
};

const CURRENT: Change[] = [
	{
		title: "Modulares Veranstaltungsmodul",
		text: "Das Veranstaltungsmodul ist nun modular aufgebaut. Ihr könnt nun beim Anlegen einer Veranstaltung unterschiedliche Bereiche aktivieren oder deaktivieren, um die Veranstaltung auf eure Bedürfnisse anzupassen (z.B. Anmeldung, Check-In, Programm, Öffentliche Seite).",
		icon: "/icons/Veranstaltungen.png",
		featured: true,
	},
	{
		title: "Monatskalender",
		text: "Das Design des Kalenders wurde überarbeitet. Er ist nun moderner und benutzerfreundlicher. Ihr könnt nun die Ansicht des Kalenders auf Wochen, Monate und Jahre ändern.",
		icon: "/icons/Kalender.png",
	},
	{
		title: "Projektübersicht",
		text: "Es gibt nun eine Projektübersicht, in der ihr alle Projekte und ihre Aufgaben sehen könnt (u.a. die euch zugewiesenen Aufgaben).",
		icon: "/icons/Projektmanagement.png",
	},
	{
		title: "Umfrageoptionen",
		text: "Es gibt nun mehr Optionen für Umfragen. Ihr könnt nun die Ergebnisse der Umfrage öffentlich machen und weitere Einstellungsmöglichkeiten zur Durchführung der Umfrage einstellen (z.B. Start, Ende, Weiterleitung).",
		icon: "/icons/Umfragen.png",
	},
	{
		title: "Wiki - Etherpad Integration",
		text: "Es gibt nun eine Etherpad Integration im Wiki. Ihr könnt nun im Wiki ein Kapitel erstellen und es mit Etherpad bearbeiten.",
		icon: "/icons/Wiki.png",
	},
	{
		title: "Mitgliederfunktionen",
		text: "Ihr könnt nun Mitgliedern Funktionen / Labels vergeben, zum Beispiel Kassenwart oder Finanzen. So habt ihr die Möglichkeit individuelle Rollen für Mitglieder in eurer Gruppe zu definieren.",
		featured: true,
	},
];

const PREVIOUS: Change[] = [
	{
		title: "Öffentliche Gruppenprofile",
		text: "Es gibt nun eine öffentliche Gruppenprofilseite, in der ihr eure Gruppe als Website mit Veranstaltungen, Terminen, Umfragen, Infoseiten, etc. präsentieren könnt. Ihr könnt nun Logo, Beschreibung und die Reihenfolge der Bereiche festlegen.",
		icon: "/icons/Webpraesenz.png",
		featured: true,
	},
	{
		title: "Belege im Budget",
		text: "Ihr könnt nun bei Einnahmen und Ausgaben Belege hinterlegen, die dann im Budget automatisiert berücksichtigt und berechnet werden.",
		icon: "/icons/Finanzen.png",
	},
	{
		title: "Landing-Page - Funktionen & Forschung",
		text: "Es gibt nun die Bereiche Funktionen und Forschung auf der Landing-Page. In den Funktionen könnt ihr sehen, was ihr mit jedem Werkzeug machen könnt. Unter Forschung liegen unsere aktuellen Forschungsbeiträge zu Univocal.",
	},
	{
		title: "Datensparsame Reichweitenmessung",
		text: "Für die stetige Verbesserung von Univocal haben wir nun eine datensparsame Reichweitenmessung implementiert. In der Datenschutzerklärung steht das unter „Datensparsame Reichweitenmessung“.",
	},
	{
		title: "UI - Verbesserungen",
		text: "Das UI wurde überarbeitet. Es gibt nun ein neues Design mit helleren Farben und einem moderneren Look. Außerdem wurden einige Fehler behoben und die Performance verbessert.",
	},
];

const ChangeCard = (props: { change: Change; index: number }) => {
	return (
		<article
			className={props.change.featured ? `${classes.card} ${classes.cardFeatured}` : classes.card}
			style={{ ["--rise" as string]: `${props.index * 70}ms` }}
		>
			<div className={classes.shell}>
				<div className={classes.core}>
					<Group
						justify="space-between"
						align="flex-start"
						wrap="nowrap"
						mb="sm"
					>
						<Text className={classes.index}>{String(props.index + 1).padStart(2, "0")}</Text>
						{props.change.icon && (
							<Image
								className={classes.icon}
								src={UVC_ASSETS_URL + props.change.icon}
								alt=""
							/>
						)}
					</Group>
					<Title
						order={3}
						size={props.change.featured ? "h3" : "h4"}
						c={COLORS.PRIMARY}
						fw={800}
						style={{ letterSpacing: "-0.02em" }}
					>
						{props.change.title}
					</Title>
					<Text
						mt="xs"
						c={COLORS.TEXT}
						lh={1.65}
					>
						{props.change.text}
					</Text>
				</div>
			</div>
		</article>
	);
};

const Eyebrow = (props: { children: string }) => {
	return (
		<Text
			component="p"
			m={0}
			px="sm"
			py={6}
			w="fit-content"
			fw={700}
			fz={11}
			tt="uppercase"
			c={COLORS.PRIMARY}
			bg={COLORS.SECONDARY}
			style={{ borderRadius: 999, letterSpacing: "0.18em" }}
		>
			{props.children}
		</Text>
	);
};

const Changelog = () => {
	return (
		<>
			<LandingPageView path="/funktionen/changelog" />
			<UVCHero
				title="Changelog"
				content="Hier könnt ihr sehen, was sich in den letzten Versionen von Univocal getan hat und wie ihr von den Änderungen profitieren könnt."
				justify="center"
			/>
			<Box
				component="section"
				bg="white"
				py={{ base: "4rem", sm: "6.5rem" }}
				px={{ base: "md", sm: "xl" }}
			>
				<div className={classes.release} style={{ maxWidth: 1120, marginInline: "auto" }}>
					<div className={classes.masthead}>
						<Eyebrow>Aktuelle Version</Eyebrow>
						<p className={classes.version}>1.1.1</p>
						<p className={classes.lead}>Sechs Änderungen für die tägliche Arbeit in der Gruppe.</p>
					</div>
					<div className={classes.grid}>
						{CURRENT.map((change, index) => (
							<ChangeCard
								key={change.title}
								change={change}
								index={index}
							/>
						))}
					</div>
				</div>
				<div
					className={`${classes.release} ${classes.earlier}`}
					style={{ maxWidth: 1120, marginInline: "auto" }}
				>
					<div className={`${classes.masthead} ${classes.mastheadQuiet}`}>
						<Eyebrow>Vorherige Version</Eyebrow>
						<p className={`${classes.version} ${classes.versionEarlier}`}>1.1.0</p>
						<p className={classes.lead}>
							Ihr veröffentlicht eine eigene Seite, hinterlegt Belege im Haushalt und findet Funktionen und Forschung auf dieser Website.
						</p>
					</div>
					<div className={classes.grid}>
						{PREVIOUS.map((change, index) => (
							<ChangeCard
								key={change.title}
								change={change}
								index={index}
							/>
						))}
					</div>
				</div>
			</Box>
		</>
	);
};

export default Changelog;
