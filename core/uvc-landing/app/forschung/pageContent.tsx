"use client";

import { Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconChartDots3, IconFileText } from "@tabler/icons-react";
import UVCHero from "../../components/UVCHero";
import { LandingPageView } from "../../components/LandingStats";
import { ResearchCard, ResearchSection } from "../../components/features/research/ResearchParts";
import { COLORS } from "../../constants/Colors";

const AREAS = [
	{
		href: "/forschung/beitraege",
		icon: IconFileText,
		title: "Forschungsbeiträge",
		text: "Beiträge, Vorträge und Ergebnisse aus der Begleitforschung zu univocal, mit Zitation und Material zum Download.",
	},
	{
		href: "/forschung/opendata",
		icon: IconChartDots3,
		title: "Open Data Hub",
		text: "Offene Kennzahlen zur Nutzung von univocal, die wir veröffentlichen, sobald genug Gruppen dabei sind.",
	},
];

const Forschung = () => (
	<>
		<LandingPageView path="/forschung" />
		<UVCHero
			title="Forschung"
			content="univocal entsteht zusammen mit Forschung zu studentischer Partizipation. Hier veröffentlichen wir unsere Beiträge und nach und nach die Daten, auf denen sie beruhen."
			justify="center"
		/>

		<ResearchSection id="bereiche">
			<SimpleGrid
				cols={{ base: 1, sm: 2 }}
				spacing="lg"
			>
				{AREAS.map((area) => (
					<ResearchCard
						key={area.href}
						href={area.href}
					>
						<Stack
							gap="sm"
							h="100%"
						>
							<Flex
								align="center"
								gap="sm"
							>
								<area.icon
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
									{area.title}
								</Title>
							</Flex>
							<Text
								size="sm"
								c={COLORS.TEXT}
								lh={1.6}
								style={{ flex: 1 }}
							>
								{area.text}
							</Text>
							<Flex
								align="center"
								gap={6}
								c={COLORS.PRIMARY}
							>
								<Text
									size="sm"
									fw={700}
									c={COLORS.PRIMARY}
								>
									Ansehen
								</Text>
								<IconArrowRight
									size={16}
									stroke={1.5}
								/>
							</Flex>
						</Stack>
					</ResearchCard>
				))}
			</SimpleGrid>
		</ResearchSection>
	</>
);

export default Forschung;
