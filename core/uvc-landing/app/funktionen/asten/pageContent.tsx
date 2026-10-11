"use client";

import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import AudiencePage from "../../../components/features/functions/AudiencePage";
import { ASTA_USE_CASES } from "../../../constants/Functions";

const B = (props: { children: ReactNode }) => (
	<Text span fw={700}>
		{props.children}
	</Text>
);

const Asten = () => {
	return (
		<AudiencePage
			path="/funktionen/asten"
			title="Für ASten"
			hero="Professionelle Verwaltung für die Studierendenschaft. Referate, Haushalt und Termine auf einer Plattform."
			useCases={ASTA_USE_CASES}
			body={
				<>
					Als Herz der studentischen Selbstverwaltung benötigt der AStA eine Infrastruktur, die Verlässlichkeit
					mit Flexibilität verbindet. Univocal bündelt alle Referate auf einer Plattform. Nutzt <B>Umfragen</B>{" "}
					für Meinungsbilder, koordiniert komplexe <B>Finanzplanungen</B> und pflegt einen zentralen{" "}
					<B>Kalender</B> für die gesamte Studierendenschaft. Dank der <B>SSO-Anbindung (via Shibboleth)</B>{" "}
					entfällt die lästige manuelle Account-Erstellung: Studierende können sich einfach mit ihrem gewohnten
					Uni-Login anmelden und direkt mit der Arbeit in den Referaten starten.
				</>
			}
		/>
	);
};

export default Asten;
