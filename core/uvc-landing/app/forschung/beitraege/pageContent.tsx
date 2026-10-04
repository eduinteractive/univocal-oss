"use client";

import { Badge, Box, Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import UVCHero from "../../../components/UVCHero";
import { LandingPageView } from "../../../components/LandingStats";
import { ResearchCard, ResearchSection } from "../../../components/features/research/ResearchParts";
import classes from "../../../components/features/research/Research.module.css";
import { COLORS } from "../../../constants/Colors";
import { RESEARCH_CONTRIBUTIONS } from "../../../constants/Research";

const Forschungsbeitraege = () => (
	<>
		<LandingPageView path="/forschung/beitraege" />
		<UVCHero
			title="Forschungsbeiträge"
			content="Hier veröffentlichen wir Forschungsergebnisse rund um univocal. Zu jedem Beitrag findest du die Zitation im APA-Stil und das zugehörige Material, etwa den Beitrag selbst und die Vortragsfolien, als Download."
			justify="center"
		/>

		<ResearchSection id="beitraege">
			<Stack gap="lg">
				{RESEARCH_CONTRIBUTIONS.map((contribution) => (
					<ResearchCard key={contribution.id}>
						<Stack gap="lg">
							<Stack gap="sm">
								<Badge
									color={COLORS.PRIMARY}
									variant="light"
									radius="sm"
								>
									{contribution.type}
								</Badge>
								<Title
									order={2}
									size="h4"
									c={COLORS.PRIMARY}
									fw={800}
									style={{ letterSpacing: "-0.01em" }}
								>
									{contribution.apa.title}
								</Title>
								<Text
									size="md"
									c={COLORS.TEXT}
									lh={1.65}
								>
									{contribution.summary}
								</Text>
							</Stack>

							<Box
								bg={COLORS.SECONDARY}
								p={{ base: "md", sm: "lg" }}
								style={{ borderRadius: "0.75rem" }}
							>
								<Text
									size="sm"
									fw={700}
									c={COLORS.PRIMARY}
									mb={6}
								>
									Zitation (APA)
								</Text>
								<Text
									size="md"
									c={COLORS.TEXT}
									lh={1.65}
									className={classes.citation}
								>
									{contribution.apa.before}
									<em>{contribution.apa.title}</em>
									{contribution.apa.after}
								</Text>
								<Stack
									gap={2}
									mt="sm"
								>
									{contribution.authors.map((author) => (
										<Text
											key={author.name}
											size="sm"
											c="dimmed"
										>
											{author.name}, {author.affiliation}
										</Text>
									))}
								</Stack>
							</Box>

							<Group gap="sm">
								{contribution.downloads.map((download, index) => (
									<Button
										key={download.href}
										component="a"
										href={download.href}
										download
										radius="xl"
										color={COLORS.PRIMARY}
										variant={index === 0 ? "filled" : "outline"}
										leftSection={
											<IconDownload
												size={18}
												stroke={1.5}
											/>
										}
									>
										{download.label} ({download.detail})
									</Button>
								))}
							</Group>
						</Stack>
					</ResearchCard>
				))}
			</Stack>
		</ResearchSection>
	</>
);

export default Forschungsbeitraege;
