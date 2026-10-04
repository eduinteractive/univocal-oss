"use client";

import { Anchor, Box, Flex, Image, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import "./page.css";
import { UVC_ASSETS_URL } from "@eduinteractive/uvc-api";
import unionPanelMask from "../assets/Union.png";
import { LandingPageView } from "../components/LandingStats";
import { UVCAmbientBlobs, UVCNetworkCollaborationSvg } from "../components/UVCDecoratives";
import UVCUsageCta from "../components/UVCUsageCta";
import { COLORS } from "../constants/Colors";

const TEXT = COLORS.TEXT;

const UNIVOCAL_ABOUT_URL = "https://univocal.de/ueber-uns/";

type UVCTile = {
	label: string;
	iconPath: string;
};

const UVC_HOME_TILES: UVCTile[] = [
	{ label: "Projektmanagement", iconPath: "/icons/Projektmanagement.png" },
	{ label: "Kalender", iconPath: "/icons/Kalender.png" },
	{ label: "Gruppenchat", iconPath: "/icons/Gruppenchat.png" },
	{ label: "Wiki", iconPath: "/icons/Wiki.png" },
	{ label: "Umfragen", iconPath: "/icons/Umfragen.png" },
	{ label: "Veranstaltungen", iconPath: "/icons/Veranstaltungen.png" },
	{ label: "Finanzen", iconPath: "/icons/Finanzen.png" },
	{ label: "Webpräsenz", iconPath: "/icons/Webpraesenz.png" },
];

/** Same frame for every icon so dimensions match. `contain` scales differing PNG crops uniformly. */
const ICON_FRAME = {
	width: "min(100%, 7rem)",
	aspectRatio: "1",
	flexShrink: 0,
} as const;

const PANEL_MASK_STYLE = {
	WebkitMaskImage: `url(${unionPanelMask.src})`,
	maskImage: `url(${unionPanelMask.src})`,
	WebkitMaskSize: "100% 100%",
	maskSize: "100% 100%",
	WebkitMaskRepeat: "no-repeat",
	maskRepeat: "no-repeat",
	WebkitMaskPosition: "top center",
	maskPosition: "top center",
} as const;

const HomePage = () => {
	const theme = useMantineTheme();
	const g = theme.spacing.md;
	const tileWidth = {
		base: `calc((100% - ${g}) / 2)`,
		sm: `calc((100% - ${g} * 3) / 4)`,
	} as const;

	return (
		<>
			<LandingPageView path="/" />
			<Stack gap={0}>
				<Box
					component="section"
					data-landing-section="hero"
					mih="100%"
					pt={50}
					bg={COLORS.SECONDARY}
				>
					<Box
						bg="white"
						w="100%"
						maw="100%"
						mx="auto"
						px={{ base: "md", sm: "xl" }}
						py={{ base: "xl", sm: "3rem" }}
						pb={{ base: "2.5rem", sm: "3.5rem" }}
						style={PANEL_MASK_STYLE}
					>
						<Stack
							gap="xl"
							align="center"
							w="100%"
							pt="md"
						>
							<Stack
								gap={4}
								align="center"
							>
								<Title
									order={1}
									c={TEXT}
									fw={800}
									style={{ letterSpacing: "-0.02em" }}
								>
									univocal
								</Title>
								<Text
									c={TEXT}
									size="lg"
									fw={500}
									opacity={0.92}
									mt="xs"
								>
									Weil jede Meinung zählt.
								</Text>
							</Stack>

							<Box
								w="100%"
								px={{ base: 0, md: 175 }}
								style={{ overflowX: "hidden" }}
							>
								<Flex
									gap="md"
									w="100%"
									wrap="wrap"
									justify="center"
								>
									{UVC_HOME_TILES.map((tile) => (
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
														justifyContent:
															"center",
													}}
												>
													<Box
														className="uvc-tool-icon"
														style={
															ICON_FRAME
														}
													>
														<Image
															src={
																UVC_ASSETS_URL +
																tile.iconPath
															}
															alt=""
															w="100%"
															h="100%"
															fit="contain"
														/>
													</Box>
												</Box>
												<Text
													c={TEXT}
													fw="bold"
													fz="md"
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
						</Stack>
					</Box>
				</Box>

				<Box
					component="section"
					pos="relative"
					py={{ base: "3rem", sm: "4rem" }}
					px={{ base: "md", sm: "xl" }}
					bg={COLORS.SECONDARY}
					style={{
						overflow: "hidden",
						borderTop: "1px solid rgba(18, 8, 117, 0.06)",
					}}
				>
					<UVCAmbientBlobs />
					<Box
						maw={1120}
						mx="auto"
						pos="relative"
						style={{ zIndex: 1 }}
					>
						<Box data-feature="section-1" data-landing-section="plattform" className="uvc-feature">
							<Title
								order={2}
								size="h3"
								c={COLORS.PRIMARY}
								fw={800}
								style={{ letterSpacing: "-0.02em" }}
								ta="left"
								className="uvc-feature__title"
							>
								Eine Plattform: Von der Fachschaft bis zum
								Prüfungsausschuss.
							</Title>

							<Box className="uvc-feature__body">
								<Box className="uvc-feature__float">
									<Image
										src={`${UVC_ASSETS_URL}/Landing_Image_1.png`}
										alt="univocal"
										w="100%"
										h="auto"
										fit="contain"
										style={{ display: "block" }}
									/>
								</Box>
								<Text component="p" size="md" c={TEXT} lh={1.65} m={0}>
									<Text span fw={700}>Univocal</Text> ist die zentrale digitale Heimat für alles, was das Campusleben bewegt.
									Von der agilen Selbstorganisation der{" "}
									<Text span fw={700}>Fachschaften und Hochschulgruppen</Text> bis hin zur strukturierten Arbeit in{" "}
									<Text span fw={700}>Gremien und Ausschüssen</Text> – wir führen zusammen, was bisher in unzähligen Tools verstreut war.
									Univocal bietet Universitäten einen geschützten Raum für effiziente Kollaboration, transparente Kommunikation und gelebte studentische Mitbestimmung.
								</Text>
							</Box>
						</Box>
					</Box>
				</Box>

				<Box
					component="section"
					pos="relative"
					py={{ base: "3rem", sm: "4rem" }}
					px={{ base: "md", sm: "xl" }}
					bg="white"
					style={{
						overflow: "hidden",
						borderTop: "1px solid rgba(18, 8, 117, 0.06)",
					}}
				>
					<UVCAmbientBlobs />
					<Box
						maw={1120}
						mx="auto"
						pos="relative"
						style={{ zIndex: 1 }}
					>
						<Box data-feature="section-2" data-landing-section="open-source" className="uvc-feature">
							<Title
								order={2}
								size="h3"
								c={COLORS.PRIMARY}
								fw={800}
								style={{ letterSpacing: "-0.02em" }}
								ta="left"
								className="uvc-feature__title"
							>
								Transparent, sicher, partizipativ: Open Source
								aus Überzeugung
							</Title>

							<Box className="uvc-feature__body">
								<Box className="uvc-feature__float uvc-feature__float--sm">
									<Image
										src={`${UVC_ASSETS_URL}/Landing_Image_2.png`}
										alt="univocal"
										w="100%"
										h="auto"
										fit="contain"
										style={{ display: "block" }}
									/>
								</Box>
								<Text component="p" size="md" c={TEXT} lh={1.65} m={0}>
									Wir glauben, dass Software für die Bildung so offen sein sollte wie die Wissenschaft selbst.
									Deshalb ist Univocal{" "}
									<Text span fw={700}>vollständig Open Source</Text>. Für Ihre Universität bedeutet das:{" "}
									<Text span fw={700}>Maximale Datensouveränität</Text> und volle Transparenz ohne Vendor-Lock-in.
									Der Quellcode ist jederzeit einsehbar und auditierbar, was höchste Sicherheitsstandards garantiert.
									Gemeinsam mit einer wachsenden Community entwickeln wir eine Lösung, die den Werten von Freiheit
									und Unabhängigkeit im digitalen Raum entspricht.
								</Text>
							</Box>
						</Box>
					</Box>
				</Box>

				<UVCUsageCta />
			</Stack>
		</>
	);
};

export default HomePage;
