"use client";

import { Box, Button, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub, IconCloud, IconMailForward, IconServer2 } from "@tabler/icons-react";
import { SaasOfferModal } from "./SaasOfferModal";
import { trackLandingCta } from "./LandingStats";
import { UVCCtaDotPattern } from "./UVCDecoratives";
import { COLORS } from "../constants/Colors";

const TEXT = COLORS.TEXT;

const UVC_GITHUB_URL = "https://github.com/eduinteractive/univocal-oss";

interface UVCUsageCtaProps {
	title?: string;
	description?: string;
}

/** Self-hosting and SaaS options, shared by the home page and the research pages. */
const UVCUsageCta = ({
	title = "Du willst univocal nutzen?",
	description = "Wähle zwischen eigenem Hosting mit dem Open-Source-Code oder einem gehosteten SaaS-Angebot für deine Hochschule.",
}: UVCUsageCtaProps) => {
	const [saasOfferOpen, { open: openSaasOffer, close: closeSaasOffer }] = useDisclosure(false);

	return (
		<Box
			component="section"
			data-landing-section="nutzung"
			bg={COLORS.SECONDARY}
			py={{ base: "2.5rem", sm: "3.5rem" }}
			px={{ base: "md", sm: "xl" }}
			style={{
				borderTop: "1px solid rgba(18, 8, 117, 0.08)",
			}}
		>
			<SaasOfferModal
				opened={saasOfferOpen}
				onClose={closeSaasOffer}
			/>
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
							{title}
						</Title>
						<Text
							size="md"
							c={TEXT}
							opacity={0.9}
							lh={1.55}
						>
							{description}
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
											color={COLORS.PRIMARY}
										/>
										<Title
											order={3}
											size="h4"
											c={COLORS.PRIMARY}
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
										univocal ist Open Source. Du kannst es auf eigener Infrastruktur installieren und
										betreiben. Code und Releases liegen auf GitHub.
									</Text>
								</Stack>
								<Button
									component="a"
									href={UVC_GITHUB_URL}
									onClick={() => trackLandingCta("homepage_github")}
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
											backgroundColor: COLORS.PRIMARY,
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
										<IconCloud
											size={28}
											stroke={1.25}
											color={COLORS.PRIMARY}
										/>
										<Title
											order={3}
											size="h4"
											c={COLORS.PRIMARY}
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
										Wir betreiben die Plattform in der IONOS Cloud. Die Infrastruktur dort ist nach ISO/IEC
										27001 zertifiziert. Wenn ihr nicht selbst hosten wollt, übernehmen wir Betrieb und
										Support für eure Hochschule. Fragt unverbindlich an.
									</Text>
								</Stack>
								<Button
									type="button"
									onClick={() => {
										trackLandingCta("homepage_saas_offer");
										openSaasOffer();
									}}
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
											borderColor: "rgba(18, 8, 117, 0.25)",
											fontWeight: 600,
											backgroundColor: "rgba(255,255,255,0.95)",
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
	);
};

export default UVCUsageCta;
