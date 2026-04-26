"use client";
import { Container, Space } from "@mantine/core";
import { ImprintHTML } from "../../../constants/Legal";
import UVCHero from "../../../components/UVCHero";

const Imprint = () => {
	return (
		<>
			<UVCHero
				title="Impressum"
                subtitle="Hier findest du das vollständige Impressum von univocal mit allen relevanten Angaben gemäß §5 TMG und weiteren rechtlichen Hinweisen."
				content=""
				justify="center"
			/>
            <Space h="sm" />
			<Container size="lg">
				<div dangerouslySetInnerHTML={{ __html: ImprintHTML }} />
			</Container>
		</>
	);
};

export default Imprint;
