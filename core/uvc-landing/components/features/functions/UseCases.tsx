"use client";

import { useState } from "react";
import { Box, Image, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { UVC_ASSETS_URL } from "@eduinteractive/uvc-api";
import { COLORS } from "../../../constants/Colors";
import type { UseCase } from "../../../constants/Functions";

const UseCaseCard = (props: { useCase: UseCase }) => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const stepCount = props.useCase.steps.length;

	const toggle = (index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	};

	const columns =
		openIndex === null
			? `repeat(${stepCount}, minmax(0, 1fr))`
			: props.useCase.steps
					.map((_, index) =>
						index === openIndex ? "minmax(14rem, 2.75fr)" : "minmax(0, 1fr)"
					)
					.join(" ");

	return (
		<Stack gap="md">
			<Title
				order={4}
				c={COLORS.PRIMARY}
				fw={800}
				style={{ letterSpacing: "-0.01em" }}
			>
				{props.useCase.title}
			</Title>
			<Box
				className="uvc-usecase-row"
				style={
					{
						["--uvc-usecase-columns" as string]: columns,
					} as React.CSSProperties
				}
			>
				{props.useCase.steps.map((step, index) => {
					const isExpanded = openIndex === index;
					return (
						<UnstyledButton
							key={step.label}
							onClick={() => toggle(index)}
							aria-expanded={isExpanded}
							aria-label={
								isExpanded
									? `${step.label} schließen`
									: `${step.label} öffnen`
							}
							p="md"
							className={`uvc-usecase-box${isExpanded ? " uvc-usecase-box--expanded" : ""}`}
							style={{
								borderRadius: "0.75rem",
								backgroundColor: COLORS.SECONDARY,
								border: "1px solid rgba(18, 8, 117, 0.15)",
							}}
						>
							<Box className="uvc-usecase-box__label-clip">
								<Box className="uvc-usecase-box__label-inner">
									<Text
										className="uvc-usecase-box__label"
										fw={700}
										c={COLORS.PRIMARY}
										ta="center"
										size="sm"
									>
										{step.label}
									</Text>
								</Box>
							</Box>
							<Box className="uvc-usecase-box__detail-clip">
								<Box className="uvc-usecase-box__detail-inner">
									<Stack
										gap={4}
										className="uvc-usecase-box__detail-text"
									>
										<Box className="uvc-usecase-box__detail-heading">
											<Image
												className="uvc-usecase-box__icon uvc-usecase-box__icon--sm"
												src={`${UVC_ASSETS_URL}/functions/${step.icon}`}
												alt=""
												w={40}
												h={40}
												fit="contain"
											/>
											<Text
												fw={700}
												c={COLORS.PRIMARY}
											>
												{step.label}
											</Text>
										</Box>
										<Text
											size="sm"
											c={COLORS.TEXT}
											lh={1.55}
										>
											{step.text}
										</Text>
									</Stack>
									<Image
										className="uvc-usecase-box__icon uvc-usecase-box__icon--lg"
										src={`${UVC_ASSETS_URL}/functions/${step.icon}`}
										alt=""
										w={110}
										h={110}
										fit="contain"
									/>
								</Box>
							</Box>
						</UnstyledButton>
					);
				})}
			</Box>
		</Stack>
	);
};

const UseCaseList = (props: { useCases: UseCase[] }) => {
	return (
		<Stack gap="xl">
			{props.useCases.map((useCase) => (
				<UseCaseCard
					key={useCase.title}
					useCase={useCase}
				/>
			))}
		</Stack>
	);
};

export default UseCaseList;
