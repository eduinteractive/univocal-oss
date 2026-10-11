"use client";

import type React from "react";
import { IconChartDots3, IconChevronDown, IconFileText, IconLayoutGrid, IconLogin, IconNews, IconRoute, IconSchool, IconBuildingCommunity, IconUsersGroup } from "@tabler/icons-react";
import {
	ActionIcon,
	AppShell,
	Burger,
	Button,
	Center,
	Collapse,
	Divider,
	Drawer,
	Flex,
	Group,
	HoverCard,
	rem,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
	UnstyledButton,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import classes from "./UVCAppShell.module.css";
import UVCLogo from "./UVCLogo";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { COLORS } from "../constants/Colors";
import { LandingTracker, trackLandingCta, trackLandingInteraction } from "./LandingStats";

const footerData = [
	{
		label: "Allgemeine Geschäftsbedingungen",
		link: "/service/agb",
	},
	{
		label: "Nutzungsbedingungen",
		link: "/service/nutzungsbedingungen",
	},
	{
		label: "Datenschutzerklärung",
		link: "/service/privacy",
	},
	{
		label: "Impressum",
		link: "/service/imprint",
	},
];

const audienceLinks = [
	{
		icon: IconSchool,
		title: "Für Fachschaften",
		description: "Events, Finanzen, Wiki und die eigene Webpräsenz für die Fachschaft",
		link: "/funktionen/fachschaften",
	},
	{
		icon: IconBuildingCommunity,
		title: "Für ASten",
		description: "Referate, Haushalt und Stimmungsbilder für die Studierendenschaft",
		link: "/funktionen/asten",
	},
	{
		icon: IconUsersGroup,
		title: "Für Gremien und Ausschüsse",
		description: "Sitzungen, Beschlüsse und Termine für die akademische Selbstverwaltung",
		link: "/funktionen/gremien",
	},
];

const moreLinks = [
	{
		icon: IconLayoutGrid,
		title: "Funktionsübersicht",
		description: "Alle Werkzeuge auf einen Blick",
		link: "/funktionen",
	},
	{
		icon: IconNews,
		title: "Changelog",
		description: "Was in der aktuellen Version dazu kam",
		link: "/funktionen/changelog",
	},
	{
		icon: IconRoute,
		title: "Roadmap",
		description: "Was als Nächstes folgt",
		link: "/funktionen/roadmap",
	},
];

const researchLinks = [
	{
		icon: IconFileText,
		title: "Forschungsbeiträge",
		description: "Beiträge und Vorträge mit Zitation und Material zum Download",
		link: "/forschung/beitraege",
	},
	{
		icon: IconChartDots3,
		title: "Open Data Hub",
		description: "Offene Nutzungsstatistiken und Kennzahlen zu univocal",
		link: "/forschung/opendata",
	},
];

interface UVCAppShellProps {
	children: React.ReactNode;
}

const UVCAppShell = (props: UVCAppShellProps) => {
	const [queryClient] = useState(() => new QueryClient());
	const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
	const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
	const [functionsOpened, { toggle: toggleFunctions }] = useDisclosure(false);
	const theme = useMantineTheme();
	const matchMedia = useMediaQuery(`(min-width: ${rem(theme.breakpoints.sm)})`);

	const menuItem = (item: { icon: React.ElementType; title: string; description: string; link: string }) => (
		<Link
			key={item.link}
			href={item.link}
			className={classes.subLink}
			onClick={closeDrawer}
		>
			<Group
				wrap="nowrap"
				align="flex-start"
			>
				<ThemeIcon
					size={34}
					variant="light"
					color={COLORS.PRIMARY}
					radius="md"
				>
					<item.icon
						size={20}
						stroke={1.5}
					/>
				</ThemeIcon>
				<div>
					<Text
						size="sm"
						fw={600}
						c={COLORS.PRIMARY}
					>
						{item.title}
					</Text>
					<Text
						size="xs"
						c="dimmed"
					>
						{item.description}
					</Text>
				</div>
			</Group>
		</Link>
	);

	const audienceItems = audienceLinks.map(menuItem);
	const moreItems = moreLinks.map(menuItem);
	const researchItems = researchLinks.map(menuItem);

	const groups = footerData.map((group, index) => (
		<Text<"a">
			key={index + group.label}
			className={classes.linkFooter}
			component="a"
			href={group.link}
			ta="right"
			c="white"
		>
			{group.label}
		</Text>
	));

	return (
		<QueryClientProvider client={queryClient}>
			<LandingTracker />
			<AppShell
				header={{ height: 60 }}
				footer={{ height: "auto", offset: true }}
			>
				<AppShell.Header px="md">
					<Group
						justify="space-between"
						h="100%"
						wrap="nowrap"
					>
						<UVCLogo />
						<Group
							h="100%"
							gap={0}
							visibleFrom="sm"
							wrap="nowrap"
						>
							<Link
								href="/"
								className={classes.link}
							>
								Startseite
							</Link>
							<HoverCard
								width={760}
								position="bottom"
								radius="md"
								shadow="md"
								withinPortal
							>
								<HoverCard.Target>
									<Link
										href="/funktionen"
										className={classes.link}
									>
										<Center inline>
											<span>Funktionen</span>
											<IconChevronDown
												size={16}
												stroke={1.5}
												style={{ marginLeft: 4 }}
											/>
										</Center>
									</Link>
								</HoverCard.Target>
								<HoverCard.Dropdown style={{ overflow: "hidden" }}>
									<SimpleGrid
										cols={2}
										spacing="lg"
									>
										<Stack gap={0}>
											<Text
												fw={600}
												c={COLORS.PRIMARY}
												px="md"
											>
												Zielgruppe
											</Text>
											<Divider my="sm" />
											{audienceItems}
										</Stack>
										<Stack
											gap={0}
											style={{ borderLeft: "1px solid rgba(18, 8, 117, 0.08)", paddingLeft: "var(--mantine-spacing-md)" }}
										>
											<Text
												fw={600}
												c={COLORS.PRIMARY}
												px="md"
											>
												Mehr
											</Text>
											<Divider my="sm" />
											{moreItems}
										</Stack>
									</SimpleGrid>
								</HoverCard.Dropdown>
							</HoverCard>
							<HoverCard
								width={600}
								position="bottom"
								radius="md"
								shadow="md"
								withinPortal
							>
								<HoverCard.Target>
									<Link
										href="/forschung"
										className={classes.link}
									>
										<Center inline>
											<span>Forschung</span>
											<IconChevronDown
												size={16}
												stroke={1.5}
												style={{ marginLeft: 4 }}
											/>
										</Center>
									</Link>
								</HoverCard.Target>
								<HoverCard.Dropdown style={{ overflow: "hidden" }}>
									<Group
										justify="space-between"
										px="md"
									>
										<Text
											fw={600}
											c={COLORS.PRIMARY}
										>
											Forschung
										</Text>
										<Link
											href="/forschung"
											style={{ fontSize: "var(--mantine-font-size-xs)", color: COLORS.PRIMARY }}
										>
											Zur Übersicht
										</Link>
									</Group>
									<Divider my="sm" />
									<SimpleGrid
										cols={2}
										spacing={0}
									>
										{researchItems}
									</SimpleGrid>
									<div className={classes.dropdownFooter}>
										<Text
											size="sm"
											fw={600}
											c={COLORS.PRIMARY}
										>
											Begleitforschung zu studentischer Partizipation
										</Text>
										<Text
											size="xs"
											c="dimmed"
										>
											Wir veröffentlichen Ergebnisse und offene Daten, sobald sie vorliegen.
										</Text>
									</div>
								</HoverCard.Dropdown>
							</HoverCard>
							<a
								href="/faq"
								className={classes.link}
							>
								FAQ
							</a>
							<Button
								component="a"
								href="https://apps.univocal.de"
								onClick={() => trackLandingCta("header_login")}
								ml="lg"
                                color={COLORS.PRIMARY}
                                radius="xl"
							>
								Login
							</Button>
						</Group>
						<Group gap="sm" hiddenFrom="sm">
							<Burger
								opened={drawerOpened}
								onClick={() => {
									if (!drawerOpened) trackLandingInteraction("mobile_menu");
									toggleDrawer();
								}}
							/>
                            <ActionIcon
								variant="filled"
								color={COLORS.PRIMARY}
								component="a"
								href="https://apps.univocal.de"
								onClick={() => trackLandingCta("header_login")}
                                size="lg"
							>
								<IconLogin />
							</ActionIcon>
						</Group>
					</Group>
					<Drawer
						opened={drawerOpened}
						onClose={closeDrawer}
						size="100%"
						padding="md"
						title={<UVCLogo />}
						hiddenFrom="sm"
						zIndex={1000000}
					>
						<ScrollArea mx="-md">
							<Divider mb="sm" />

							<Link
								className={classes.link}
								href="/"
							>
								Startseite
							</Link>
							<Group
								gap={0}
								wrap="nowrap"
								w="100%"
							>
								<Link
									className={classes.link}
									href="/funktionen"
									onClick={closeDrawer}
									style={{ width: "auto", flex: 1 }}
								>
									Funktionen
								</Link>
								<UnstyledButton
									onClick={toggleFunctions}
									aria-expanded={functionsOpened}
									aria-label="Funktionen öffnen"
									px="xs"
								>
									<IconChevronDown
										size={16}
										stroke={1.5}
										style={{
											transform: functionsOpened ? "rotate(180deg)" : undefined,
											transition: "transform 200ms ease",
										}}
									/>
								</UnstyledButton>
							</Group>
							<Collapse expanded={functionsOpened}>
								<Text
									size="xs"
									fw={700}
									c="dimmed"
									px="md"
									pt="sm"
									pb={4}
								>
									Zielgruppe
								</Text>
								{audienceItems}
								<Text
									size="xs"
									fw={700}
									c="dimmed"
									px="md"
									pt="sm"
									pb={4}
								>
									Mehr
								</Text>
								{moreItems}
							</Collapse>
							<UnstyledButton
								className={classes.link}
								onClick={toggleLinks}
								aria-expanded={linksOpened}
							>
								<Center inline>
									<span>Forschung</span>
									<IconChevronDown
										size={16}
										stroke={1.5}
										style={{
											marginLeft: 4,
											transform: linksOpened ? "rotate(180deg)" : undefined,
											transition: "transform 200ms ease",
										}}
									/>
								</Center>
							</UnstyledButton>
							<Collapse expanded={linksOpened}>
								<Link
									className={classes.subLink}
									href="/forschung"
									onClick={closeDrawer}
								>
									<Text
										size="sm"
										fw={600}
										c={COLORS.PRIMARY}
									>
										Übersicht
									</Text>
								</Link>
								{researchItems}
							</Collapse>
							<a
								href="/faq"
								className={classes.link}
							>
								FAQ
							</a>
						</ScrollArea>
					</Drawer>
				</AppShell.Header>
				<AppShell.Main>{props.children}</AppShell.Main>
				<AppShell.Section
					className={classes.footer}
					px="lg"
                    bg={COLORS.PRIMARY}
				>
					<Title
						order={5}
						mb="sm"
						c="white"
					>
						Service
					</Title>
					<Flex
						direction={matchMedia ? "row" : "column"}
						justify="flex-start"
						align={matchMedia ? "center" : "flex-start"}
						pb="xl"
						gap={matchMedia ? "xl" : "sm"}
					>
						{groups}
					</Flex>
					<Flex
						justify="space-between"
						align={matchMedia ? "center" : "flex-start"}
						direction={matchMedia ? "row" : "column"}
						style={{
							borderTop: "1px solid #808080",
						}}
					>
						<Flex
							direction="column"
							justify="flex-start"
							align="flex-start"
							maw={300}
						>
							<Text
								size="xs"
								c="white"
								mt="sm"
							>
								© 2026  Education Interactive. All rights reserved.
							</Text>
						</Flex>
					</Flex>
				</AppShell.Section>
			</AppShell>
		</QueryClientProvider>
	);
};

export default UVCAppShell;
