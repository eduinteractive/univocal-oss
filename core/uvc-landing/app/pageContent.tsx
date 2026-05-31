"use client";

import { Anchor, Box, Button, Flex, Image, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub, IconCloud, IconExternalLink, IconMailForward, IconServer2 } from "@tabler/icons-react";
import "./page.css";
import { UVC_ASSETS_URL } from "@eduinteractive/uvc-api";
import unionPanelMask from "../assets/Union.png";
import { SaasOfferModal } from "../components/SaasOfferModal";
import { UVCAmbientBlobs, UVCCtaDotPattern, UVCNetworkCollaborationSvg } from "../components/UVCDecoratives";
import { COLORS } from "../constants/Colors";

const TEXT = "#2d1b4e";

const UVC_GITHUB_URL = "https://github.com/eduinteractive/univocal-oss";

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
	const [saasOfferOpen, { open: openSaasOffer, close: closeSaasOffer }] = useDisclosure(false);
	const theme = useMantineTheme();
	const g = theme.spacing.md;
	const tileWidth = {
		base: `calc((100% - ${g}) / 2)`,
		sm: `calc((100% - ${g} * 3) / 4)`,
	} as const;

	return (
		<>
			<SaasOfferModal
				opened={saasOfferOpen}
				onClose={closeSaasOffer}
			/>
			<Stack gap={0}>
				<Box
					component="section"
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
					bg="#EEECFF"
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
						<Box data-feature="section-1" className="uvc-feature">
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
						<Box data-feature="section-2" className="uvc-feature">
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

				<Box
					component="section"
					bg={"#EEECFF"}
					py={{ base: "2.5rem", sm: "3.5rem" }}
					px={{ base: "md", sm: "xl" }}
					style={{
						borderTop: "1px solid rgba(18, 8, 117, 0.08)",
					}}
				>
					<Box
						maw={960}
						mx="auto"
						pos="relative"
					>
						<UVCCtaDotPattern />
						<Stack
							gap="xl"
							align="center"
							pos="relative"
							style={{ zIndex: 1 }}
						>
							<Stack
								gap="xs"
								align="center"
								ta="center"
								maw={640}
							>
								<Title
									order={2}
									size="h3"
									c={COLORS.PRIMARY}
									fw={800}
									style={{ letterSpacing: "-0.02em" }}
								>
									Du willst univocal nutzen?
								</Title>
								<Text
									size="md"
									c={TEXT}
									opacity={0.9}
									lh={1.55}
								>
									Wähle zwischen eigenem Hosting mit dem
									Open-Source-Code oder einem gehosteten
									SaaS-Angebot für deine Hochschule.
								</Text>
							</Stack>

							<SimpleGrid
								cols={{ base: 1, sm: 2 }}
								spacing="lg"
								w="100%"
							>
								<Box
									p={{ base: "lg", sm: "xl" }}
									style={{
										borderRadius: "1rem",
										background: "#fff",
										boxShadow: "0 8px 28px rgba(18, 8, 117, 0.06)",
										border: "1px solid rgba(18, 8, 117, 0.08)",
										height: "100%",
									}}
								>
									<Stack
										gap="md"
										h="100%"
										justify="space-between"
										align="flex-start"
									>
										<Stack gap="sm">
											<Flex
												align="center"
												gap="sm"
											>
												<IconServer2
													size={28}
													stroke={1.25}
													color={
														COLORS.PRIMARY
													}
												/>
												<Title
													order={3}
													size="h4"
													c={
														COLORS.PRIMARY
													}
													fw={700}
												>
													Self Hosting
												</Title>
											</Flex>
											<Text
												size="sm"
												c={TEXT}
												lh={1.6}
											>
												univocal ist Open
												Source. Du kannst es auf
												eigener Infrastruktur
												installieren und
												betreiben. Code und
												Releases liegen auf
												GitHub.
											</Text>
										</Stack>
										<Button
											component="a"
											href={UVC_GITHUB_URL}
											target="_blank"
											rel="noopener noreferrer"
											size="md"
											radius="xl"
											fullWidth
											leftSection={
												<IconBrandGithub
													size={20}
													stroke={1.5}
												/>
											}
											styles={{
												root: {
													backgroundColor:
														COLORS.PRIMARY,
												},
											}}
											c="white"
										>
											Repository auf GitHub
										</Button>
									</Stack>
								</Box>

								<Box
									p={{ base: "lg", sm: "xl" }}
									style={{
										borderRadius: "1rem",
										background: "linear-gradient(165deg, #ffffff 0%, rgba(246, 245, 252, 0.85) 100%)",
										boxShadow: "0 8px 28px rgba(18, 8, 117, 0.06)",
										border: "1px solid rgba(18, 8, 117, 0.08)",
										height: "100%",
									}}
								>
									<Stack
										gap="md"
										h="100%"
										justify="space-between"
										align="flex-start"
									>
										<Stack gap="sm">
											<Flex
												align="center"
												gap="sm"
											>
												<IconCloud
													size={28}
													stroke={1.25}
													color={
														COLORS.PRIMARY
													}
												/>
												<Title
													order={3}
													size="h4"
													c={
														COLORS.PRIMARY
													}
													fw={700}
												>
													SaaS
												</Title>
											</Flex>
											<Text
												size="sm"
												c={TEXT}
												lh={1.6}
											>
												Wir betreiben die
												Plattform in der IONOS
												Cloud. Die Infrastruktur
												dort ist nach ISO/IEC
												27001 zertifiziert. Wenn
												ihr nicht selbst hosten
												wollt, übernehmen wir
												Betrieb und Support für
												eure Hochschule. Fragt
												unverbindlich an.
											</Text>
										</Stack>
										<Button
											type="button"
											onClick={openSaasOffer}
											size="md"
											radius="xl"
											fullWidth
											variant="white"
											leftSection={
												<IconMailForward
													size={20}
													stroke={1.5}
												/>
											}
											styles={{
												root: {
													color: COLORS.PRIMARY,
													borderColor:
														"rgba(18, 8, 117, 0.25)",
													fontWeight: 600,
													backgroundColor:
														"rgba(255,255,255,0.95)",
												},
											}}
										>
											Angebot anfragen
										</Button>
									</Stack>
								</Box>
							</SimpleGrid>
						</Stack>
					</Box>
				</Box>
			</Stack>
		</>
	);
};

export default HomePage;
