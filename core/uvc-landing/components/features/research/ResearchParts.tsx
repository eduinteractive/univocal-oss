import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Title } from "@mantine/core";
import { COLORS } from "../../../constants/Colors";
import classes from "./Research.module.css";

export const CARD_STYLE = {
	borderRadius: "1rem",
	background: "#fff",
	boxShadow: "0 8px 28px rgba(18, 8, 117, 0.06)",
	border: "1px solid rgba(18, 8, 117, 0.08)",
	height: "100%",
} as const;

interface ResearchSectionProps {
	id: string;
	bg?: string;
	title?: string;
	children: ReactNode;
}

export const ResearchSection = ({ id, bg = "white", title, children }: ResearchSectionProps) => (
	<Box
		component="section"
		data-landing-section={id}
		bg={bg}
		py={{ base: "3rem", sm: "4rem" }}
		px={{ base: "md", sm: "xl" }}
		style={{ borderTop: "1px solid rgba(18, 8, 117, 0.06)" }}
	>
		<Box
			maw={1120}
			mx="auto"
		>
			{title && (
				<Title
					order={2}
					size="h3"
					c={COLORS.PRIMARY}
					fw={800}
					mb="xl"
					style={{ letterSpacing: "-0.02em" }}
				>
					{title}
				</Title>
			)}
			{children}
		</Box>
	</Box>
);

interface ResearchCardProps {
	children: ReactNode;
	href?: string;
}

export const ResearchCard = ({ children, href }: ResearchCardProps) => {
	if (href) {
		return (
			<Box
				component={Link}
				href={href}
				p={{ base: "lg", sm: "xl" }}
				className={classes.cardLink}
				style={CARD_STYLE}
			>
				{children}
			</Box>
		);
	}
	return (
		<Box
			p={{ base: "lg", sm: "xl" }}
			style={CARD_STYLE}
		>
			{children}
		</Box>
	);
};
