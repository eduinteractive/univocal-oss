"use client";

import type { ReactNode } from "react";
import { Box, Stack, Text, Title } from "@mantine/core";
import UVCHero from "../../UVCHero";
import UseCaseList from "./UseCases";
import { LandingPageView } from "../../LandingStats";
import { COLORS } from "../../../constants/Colors";
import type { LandingPath } from "@eduinteractive/uvc-api";
import type { UseCase } from "../../../constants/Functions";

const AudiencePage = (props: {
	path: LandingPath;
	title: string;
	hero: string;
	body: ReactNode;
	useCases: UseCase[];
}) => {
	return (
		<>
			<LandingPageView path={props.path} />
			<UVCHero
				title={props.title}
				content={props.hero}
				justify="center"
			/>
			<Box
				component="section"
				bg="white"
				py={{ base: "3rem", sm: "4rem" }}
				px={{ base: "md", sm: "xl" }}
			>
				<Stack
					gap="xl"
					maw={1120}
					mx="auto"
				>
					<Box
						bg={COLORS.SECONDARY}
						p={{ base: "lg", sm: "xl" }}
						style={{ borderRadius: "1.5rem" }}
					>
						<Stack gap="md">
							<Title
								order={3}
								size="h4"
								c={COLORS.PRIMARY}
								fw={800}
								style={{ letterSpacing: "-0.01em" }}
							>
								{props.title}
							</Title>
							<Box
								bg="white"
								p={{ base: "md", sm: "lg" }}
								style={{
									borderRadius: "0.75rem",
									boxShadow: "0 4px 16px rgba(18, 8, 117, 0.05)",
								}}
							>
								<Text
									component="p"
									size="md"
									c={COLORS.TEXT}
									lh={1.65}
									m={0}
								>
									{props.body}
								</Text>
							</Box>
						</Stack>
					</Box>
					<UseCaseList useCases={props.useCases} />
				</Stack>
			</Box>
		</>
	);
};

export default AudiencePage;
