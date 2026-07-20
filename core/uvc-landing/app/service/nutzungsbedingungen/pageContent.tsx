"use client";

import { Container, Space } from "@mantine/core";
import { TermsOfUseHTML } from "../../../constants/Legal";
import UVCHero from "../../../components/UVCHero";

const TermsOfUse = () => {
	return (
		<>
			<UVCHero
				title="Community-Richtlinie / Nutzungsbedingungen"
				subtitle="Regeln für die Förderung der Gremienarbeit in Universitäten auf univocal."
				content=""
				justify="center"
			/>
			<Space h="sm" />
			<Container size="lg">
				<div dangerouslySetInnerHTML={{ __html: TermsOfUseHTML }} />
			</Container>
		</>
	);
};

export default TermsOfUse;
