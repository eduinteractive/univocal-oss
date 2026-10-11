"use client";

import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import AudiencePage from "../../../components/features/functions/AudiencePage";
import { GREMIEN_USE_CASES } from "../../../constants/Functions";

const B = (props: { children: ReactNode }) => (
	<Text span fw={700}>
		{props.children}
	</Text>
);

const Gremien = () => {
	return (
		<AudiencePage
			path="/funktionen/gremien"
			title="Für Gremien und Ausschüsse"
			hero="Strukturierte Arbeit, nachvollziehbare Ergebnisse. Sitzungen, Beschlüsse und Termine an einem Ort."
			useCases={GREMIEN_USE_CASES}
			body={
				<>
					In der akademischen Selbstverwaltung zählen Transparenz und Effizienz. Univocal unterstützt Gremien
					und Ausschüsse durch gezieltes <B>Projektmanagement</B> für langfristige Vorhaben und ein <B>Wiki</B>{" "}
					zur Dokumentation von Beschlüssen. Mit der <B>Umfrage-Funktion</B> lassen sich Meinungsbilder im
					Vorfeld einholen, während der gemeinsame <B>Kalender</B> die Terminfindung für Sitzungen vereinfacht.
					Die nahtlose <B>SSO-Integration</B> garantiert dabei, dass nur autorisierte Universitätsangehörige
					Zugriff auf vertrauliche Unterlagen haben – sicher und DSGVO-konform.
				</>
			}
		/>
	);
};

export default Gremien;
