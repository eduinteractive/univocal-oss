"use client";

import { Box, Flex, Image, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { UVC_ASSETS_URL } from "@eduinteractive/uvc-api";
import "../page.css";
import UVCHero from "../../components/UVCHero";
import UseCaseList from "../../components/features/functions/UseCases";
import SectionDivider from "../../components/features/functions/SectionDivider";
import { COLORS } from "../../constants/Colors";
import {
	ASTA_USE_CASES,
	FACHSCHAFT_USE_CASES,
	GREMIEN_USE_CASES,
	type UseCase,
} from "../../constants/Functions";
import { Fragment } from "react";

type UVCTile = {
	label: string;
	iconPath: string;
};

const UVC_FEATURE_TILES: UVCTile[] = [
	{ label: "Projektmanagement", iconPath: "/icons/Projektmanagement.png" },
	{ label: "Kalender", iconPath: "/icons/Kalender.png" },
	{ label: "Gruppenchat", iconPath: "/icons/Gruppenchat.png" },
	{ label: "Wiki", iconPath: "/icons/Wiki.png" },
	{ label: "Umfragen", iconPath: "/icons/Umfragen.png" },
	{ label: "Events", iconPath: "/icons/Veranstaltungen.png" },
	{ label: "Finanzen", iconPath: "/icons/Finanzen.png" },
];

/** Same frame for every icon so dimensions match. `contain` scales differing PNG crops uniformly. */
const ICON_FRAME = {
	width: "min(100%, 7rem)",
	aspectRatio: "1",
	flexShrink: 0,
} as const;

type FeatureCard = {
	title: string;
	body: React.ReactNode;
	useCases: UseCase[];
};

const B = (props: { children: React.ReactNode }) => (
	<Text
		span
		fw={700}
	>
		{props.children}
	</Text>
);

const FEATURE_CARDS: FeatureCard[] = [
	{
		title: "Für Fachschaften: Euer Campus, eure Orga, eine App",
		body: (
			<>
				Schluss mit dem Chaos in privaten Messenger-Gruppen und verlorenen Dokumenten. Univocal ist das
				Schweizer Taschenmesser für eure Fachschaftsarbeit: Plant eure <B>Events</B> und Partys, verwaltet die{" "}
				<B>Finanzen</B> für das nächste Ersti-Wochenende und haltet Altklausuren oder Protokolle strukturiert
				im <B>Wiki</B> fest. Dank <B>Projektmanagement</B> und <B>Gruppenchat</B> behaltet ihr bei allen
				Aufgaben den Überblick. Das Beste: Über die <B>mobile App</B> habt ihr alles direkt in der
				Hosentasche, und neue Aktive lassen sich über die <B>Mitgliederverwaltung</B> blitzschnell
				integrieren.
			</>
		),
		useCases: FACHSCHAFT_USE_CASES,
	},
	{
		title: "Für ASten: Professionelle Verwaltung für die Studierendenschaft",
		body: (
			<>
				Als Herz der studentischen Selbstverwaltung benötigt der AStA eine Infrastruktur, die Verlässlichkeit
				mit Flexibilität verbindet. Univocal bündelt alle Referate auf einer Plattform. Nutzt <B>Umfragen</B>{" "}
				für Meinungsbilder, koordiniert komplexe <B>Finanzplanungen</B> und pflegt einen zentralen{" "}
				<B>Kalender</B> für die gesamte Studierendenschaft. Dank der <B>SSO-Anbindung (via Shibboleth)</B>{" "}
				entfällt die lästige manuelle Account-Erstellung: Studierende können sich einfach mit ihrem gewohnten
				Uni-Login anmelden und direkt mit der Arbeit in den Referaten starten.
			</>
		),
		useCases: ASTA_USE_CASES,
	},
	{
		title: "Für Gremien und Ausschüsse: Strukturierte Arbeit, rechtssichere Ergebnisse",
		body: (
			<>
				In der akademischen Selbstverwaltung zählen Transparenz und Effizienz. Univocal unterstützt Gremien
				und Ausschüsse durch gezieltes <B>Projektmanagement</B> für langfristige Vorhaben und ein <B>Wiki</B>{" "}
				zur Dokumentation von Beschlüssen. Mit der <B>Umfrage-Funktion</B> lassen sich Meinungsbilder im
				Vorfeld einholen, während der gemeinsame <B>Kalender</B> die Terminfindung für Sitzungen vereinfacht.
				Die nahtlose <B>SSO-Integration</B> garantiert dabei, dass nur autorisierte Universitätsangehörige
				Zugriff auf vertrauliche Unterlagen haben – sicher und DSGVO-konform.
			</>
		),
		useCases: GREMIEN_USE_CASES,
	},
];

const Funktionen = () => {
	const theme = useMantineTheme();
	const g = theme.spacing.md;
	const tileWidth = {
		base: `calc((100% - ${g}) / 2)`,
		sm: `calc((100% - ${g} * 3) / 4)`,
		lg: `calc((100% - ${g} * 6) / 7)`,
	} as const;

	return (
		<>
			<UVCHero
				title="Funktionen"
				content="Univocal vereint alle Werkzeuge für die studentische Selbstverwaltung auf einer Plattform: Projektmanagement, Kalender, Gruppenchat, Wiki, Umfragen, Events und Finanzen – auf dem Desktop und in der mobilen App."
				justify="center"
			/>

			<Box
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
					{UVC_FEATURE_TILES.map((tile) => (
						<Box
							key={tile.label}
							flex="0 0 auto"
							w={tileWidth}
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
										style={ICON_FRAME}
									>
										<Image
											src={UVC_ASSETS_URL + tile.iconPath}
											alt=""
											w="100%"
											h="100%"
											fit="contain"
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
									{tile.label}
								</Text>
							</Stack>
						</Box>
					))}
				</Flex>
			</Box>

			<Box
				component="section"
				bg="white"
				py={{ base: "3rem", sm: "4rem" }}
				px={{ base: "md", sm: "xl" }}
			>
				<Stack
					gap="xl"
					maw={1120}
					mx="auto"
				>
					<Title
						order={2}
						c={COLORS.PRIMARY}
						fw={800}
						ta="center"
						style={{ letterSpacing: "-0.02em" }}
					>
						Das kann Univocal
					</Title>

					{FEATURE_CARDS.map((card, index) => (
						<Fragment key={card.title}>
							{index > 0 && <SectionDivider />}
							<Stack gap="xl">
								<Box
									bg={COLORS.SECONDARY}
									p={{ base: "lg", sm: "xl" }}
									style={{ borderRadius: "1.5rem" }}
								>
									<Stack gap="md">
										<Title
											order={3}
											size="h4"
											c={COLORS.PRIMARY}
											fw={800}
											style={{ letterSpacing: "-0.01em" }}
										>
											{card.title}
										</Title>
										<Box
											bg="white"
											p={{ base: "md", sm: "lg" }}
											style={{
												borderRadius: "0.75rem",
												boxShadow: "0 4px 16px rgba(18, 8, 117, 0.05)",
											}}
										>
											<Text
												component="p"
												size="md"
												c={COLORS.TEXT}
												lh={1.65}
												m={0}
											>
												{card.body}
											</Text>
										</Box>
									</Stack>
								</Box>

								<UseCaseList useCases={card.useCases} />
							</Stack>
						</Fragment>
					))}
				</Stack>
			</Box>
		</>
	);
};

export default Funktionen;
