"use client";
import { Container, Space } from "@mantine/core";
import { PrivacyHTML } from "../../../constants/Legal";
import UVCHero from "../../../components/UVCHero";

const Privacy = () => {
	return (
		<>
			<UVCHero
				title="Datenschutzerklärung"
                subtitle="Hier findest du die aktuellen Datenschutzbestimmungen von univocal. Informiere dich über die Verarbeitung personenbezogener Daten und die Datenschutzstandards unserer Plattform."
				content=""
				justify="center"
			/>
            <Space h="sm" />
			<Container size="lg">
				<div dangerouslySetInnerHTML={{ __html: PrivacyHTML }} />
			</Container>
		</>
	);
};

export default Privacy;
