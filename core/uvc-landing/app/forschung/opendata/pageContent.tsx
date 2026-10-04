"use client";

import { Badge, Box, Flex, Group, SimpleGrid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconChartBar, IconChartLine, IconLayoutGrid, IconUsersGroup } from "@tabler/icons-react";
import type { ComponentType } from "react";
import UVCHero from "../../../components/UVCHero";
import { LandingPageView } from "../../../components/LandingStats";
import UVCUsageCta from "../../../components/UVCUsageCta";
import { ResearchCard, ResearchSection } from "../../../components/features/research/ResearchParts";
import { COLORS } from "../../../constants/Colors";

type Preview = "number" | "line" | "bars" | "grid";

interface Dataset {
	title: string;
	text: string;
	icon: ComponentType<{ size?: number; stroke?: number; color?: string }>;
	preview: Preview;
}

const DATASETS: Dataset[] = [
	{
		title: "Aktive Gruppen",
		text: "Wie viele Fachschaften, ASten und Gremien univocal nutzen, nach Hochschule und Gruppentyp.",
		icon: IconUsersGroup,
		preview: "number",
	},
	{
		title: "Nutzung im Zeitverlauf",
		text: "Besuche und aktive Nutzung pro Woche und Semester.",
		icon: IconChartLine,
		preview: "line",
	},
	{
		title: "Genutzte Funktionen",
		text: "Projekte, Veranstaltungen, Umfragen, Chat und Finanzen im Vergleich.",
		icon: IconChartBar,
		preview: "bars",
	},
	{
		title: "Aktivität nach Wochentag",
		text: "Wann Gruppen zusammenarbeiten, aggregiert über alle Gruppen.",
		icon: IconLayoutGrid,
		preview: "grid",
	},
];

const LINE_HEIGHTS = [38, 52, 46, 64, 58, 76, 70, 88];
const BAR_WIDTHS = ["86%", "64%", "52%", "38%", "24%"];

const Placeholder = ({ preview }: { preview: Preview }) => {
	if (preview === "number") {
		return (
			<Stack gap="sm">
				<Skeleton
					h={48}
					w={120}
					radius="sm"
				/>
				<Skeleton
					h={10}
					w="60%"
					radius="xl"
				/>
				<Skeleton
					h={10}
					w="40%"
					radius="xl"
				/>
			</Stack>
		);
	}
	if (preview === "line") {
		return (
			<Group
				gap={8}
				align="flex-end"
				h={96}
				wrap="nowrap"
			>
				{LINE_HEIGHTS.map((height, index) => (
					<Skeleton
						key={index}
						h={`${height}%`}
						radius="sm"
						style={{ flex: 1 }}
					/>
				))}
			</Group>
		);
	}
	if (preview === "bars") {
		return (
			<Stack gap={8}>
				{BAR_WIDTHS.map((width) => (
					<Skeleton
						key={width}
						h={14}
						w={width}
						radius="sm"
					/>
				))}
			</Stack>
		);
	}
	return (
		<Box style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
			{Array.from({ length: 21 }, (_, index) => (
				<Skeleton
					key={index}
					radius="sm"
					style={{ aspectRatio: "1" }}
				/>
			))}
		</Box>
	);
};

const OpenDataHub = () => (
	<>
		<LandingPageView path="/forschung/opendata" />
		<UVCHero
			title="Open Data Hub"
			content="Hier veröffentlichen wir offene Daten zu univocal: Nutzungsstatistiken und Kennzahlen, aggregiert und ohne Bezug zu einzelnen Personen. Noch nutzen zu wenige Gruppen univocal für aussagekräftige Zahlen. Die Datensätze folgen, sobald genug zusammenkommt."
			justify="center"
		/>

		<ResearchSection
			id="datensaetze"
			title="Geplante Datensätze"
		>
			<SimpleGrid
				cols={{ base: 1, sm: 2 }}
				spacing="lg"
			>
				{DATASETS.map((dataset) => (
					<ResearchCard key={dataset.title}>
						<Stack
							gap="lg"
							aria-busy="true"
						>
							<Group
								justify="space-between"
								wrap="nowrap"
							>
								<Flex
									align="center"
									gap="sm"
								>
									<dataset.icon
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
										{dataset.title}
									</Title>
								</Flex>
								<Badge
									color="pink"
									variant="light"
									radius="sm"
									style={{ flexShrink: 0 }}
								>
									Bald verfügbar
								</Badge>
							</Group>
							<Box aria-hidden>
								<Placeholder preview={dataset.preview} />
							</Box>
							<Text
								size="sm"
								c={COLORS.TEXT}
								lh={1.6}
							>
								{dataset.text}
							</Text>
						</Stack>
					</ResearchCard>
				))}
			</SimpleGrid>
		</ResearchSection>

		<UVCUsageCta
			title="Du willst zu univocal beitragen?"
			description="Werde Teil der Community und nutze univocal für eure Arbeit. Jede Gruppe, die mitmacht, macht die offenen Daten aussagekräftiger. Hoste selbst mit dem Open-Source-Code oder nutzt unser SaaS-Angebot."
		/>
	</>
);

export default OpenDataHub;
