import "@mantine/core/styles.css";
import type { Metadata } from "next";
import React from "react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { theme } from "../theme";
import UVCAppShell from "../components/UVCAppShell";

const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://univocal.de";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: "univocal",
	description:
		"univocal verbindet Projektmanagement, Kalender, Gruppenchat, Wiki, Umfragen, Veranstaltungen und Finanzen für gemeinsames Arbeiten und Meinungsbildung, alles in einer klaren Plattform.",
};

interface RootLayoutProps {
	children: React.ReactNode;
}

const RootLayout = (props: RootLayoutProps) => {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<head>
				<ColorSchemeScript />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
			</head>
			<body>
				<MantineProvider theme={theme}>
					<UVCAppShell>{props.children}</UVCAppShell>
				</MantineProvider>
			</body>
		</html>
	);
};

export default RootLayout;
