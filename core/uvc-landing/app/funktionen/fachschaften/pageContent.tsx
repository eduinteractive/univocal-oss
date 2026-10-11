"use client";

import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import AudiencePage from "../../../components/features/functions/AudiencePage";
import { FACHSCHAFT_USE_CASES } from "../../../constants/Functions";

const B = (props: { children: ReactNode }) => (
	<Text span fw={700}>
		{props.children}
	</Text>
);

const Fachschaften = () => {
	return (
		<AudiencePage
			path="/funktionen/fachschaften"
			title="Für Fachschaften"
			hero="Euer Campus, eure Orga, eine App. Plant Fahrten und Partys, haltet das Wissen fest und bleibt auf dem Campus sichtbar."
			useCases={FACHSCHAFT_USE_CASES}
			body={
				<>
					Schluss mit dem Chaos in privaten Messenger-Gruppen und verlorenen Dokumenten. Univocal ist das
					Schweizer Taschenmesser für eure Fachschaftsarbeit: Plant eure <B>Events</B> und Partys, verwaltet die{" "}
					<B>Finanzen</B> für das nächste Ersti-Wochenende und haltet Altklausuren oder Protokolle strukturiert
					im <B>Wiki</B> fest. Dank <B>Projektmanagement</B> und <B>Gruppenchat</B> behaltet ihr bei allen
					Aufgaben den Überblick. Das Beste: Über die <B>mobile App</B> habt ihr alles direkt in der
					Hosentasche, und neue Aktive lassen sich über die <B>Mitgliederverwaltung</B> blitzschnell
					integrieren. Mit eurer eigenen <B>Webpräsenz</B> seid ihr außerdem für alle auf dem Campus sichtbar.
				</>
			}
		/>
	);
};

export default Fachschaften;
