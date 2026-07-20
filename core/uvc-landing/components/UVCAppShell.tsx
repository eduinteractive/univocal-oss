"use client";

import type React from "react";
import { IconBrandInstagram, IconBrandYoutube, IconLogin } from "@tabler/icons-react";
import {
	ActionIcon,
	AppShell,
	Box,
	Burger,
	Button,
	Divider,
	Drawer,
	Flex,
	Group,
	rem,
	ScrollArea,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import classes from "./UVCAppShell.module.css";
import UVCLogo from "./UVCLogo";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { COLORS } from "../constants/Colors";

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

interface UVCAppShellProps {
	children: React.ReactNode;
}

const UVCAppShell = (props: UVCAppShellProps) => {
	const [queryClient] = useState(() => new QueryClient());
	const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
	const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
	const theme = useMantineTheme();
	const matchMedia = useMediaQuery(`(min-width: ${rem(theme.breakpoints.sm)})`);

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
							<Link
								href="/funktionen"
								className={classes.link}
							>
								Funktionen
							</Link>
							<a
								href="/faq"
								className={classes.link}
							>
								FAQ
							</a>
							<Button
								component="a"
								href="https://apps.univocal.de"
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
								onClick={toggleDrawer}
							/>
                            <ActionIcon
								variant="filled"
								color={COLORS.PRIMARY}
								component="a"
								href="https://apps.univocal.de"
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
							<Link
								className={classes.link}
								href="/funktionen"
							>
								Funktionen
							</Link>
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
