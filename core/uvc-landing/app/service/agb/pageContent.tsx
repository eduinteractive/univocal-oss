"use client";
import { Container, Space } from "@mantine/core";
import { AGBHTML } from "../../../constants/Legal";
import UVCHero from "../../../components/UVCHero";

const AGB = () => {
	return (
		<>
			<UVCHero
				title="Allgemeine Geschäftsbedingungen"
                subtitle="Hier findest du die aktuellen Allgemeinen Geschäftsbedingungen (AGB) von univocal. Informiere dich über die rechtlichen Grundlagen unserer Plattform und Services."
				content=""
				justify="center"
			/>
            <Space h="sm" />
			<Container size="lg">
				<div dangerouslySetInnerHTML={{ __html: AGBHTML }} />
			</Container>
		</>
	);
};

export default AGB;
