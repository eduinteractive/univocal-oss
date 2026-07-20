type UseCaseStep = {
	label: string;
	/** Filename in the S3 "functions" folder, e.g. "Partyzeit_1.png" */
	icon: string;
	text: string;
};

export type UseCase = {
	title: string;
	steps: UseCaseStep[];
};

export const FACHSCHAFT_USE_CASES: UseCase[] = [
	{
		title: "Fachschaftsfahrt",
		steps: [
			{
				label: "Fachschaftsfahrt",
				icon: "Fachschaftsfahrt_1.png",
				text: "Die jährliche Fachschaftsfahrt muss vorbereitet werden, aber die Hauptbeteiligten aus dem letzten Jahr haben ihr Studium bereits abgeschlossen!",
			},
			{
				label: "Wissensverwaltung & Projektboard",
				icon: "Fachschaftsfahrt_2.png",
				text: "Kein Problem: Alle wichtigen Dokumente und Hinweise haben deine Vorgänger*innen im Wiki gespeichert. In eurer nächsten Sitzung könnt ihr problemlos mit den Infos arbeiten und ein Projektboard mit allen ToDos für die Fahrt anlegen.",
			},
			{
				label: "Veranstaltungsanmeldung",
				icon: "Fachschaftsfahrt_3.png",
				text: "Jetzt braucht es nur noch Teilnehmende. Ihr legt also einfach eine neue Veranstaltung für die Fahrt an und lasst die Anmeldung komfortabel über Univocal ablaufen.",
			},
		],
	},
	{
		title: "Onboarding",
		steps: [
			{
				label: "Onboarding",
				icon: "Onboarding_1.png",
				text: "Die neuen Mitglieder finden den Anschluss nicht? Das bekommen wir hin!",
			},
			{
				label: "Single-Sign-On",
				icon: "Onboarding_2.png",
				text: "Über den komfortablen Single-Sign-On könnt ihr und eure neuen Mitstreiter euch einfach mit den Zugangsdaten eurer Uni anmelden – keine zusätzlichen Hemmschwellen, kein lästiges Anmeldeverfahren.",
			},
			{
				label: "Zugangsverwaltung",
				icon: "Onboarding_3.png",
				text: "In Univocal finden Neuankömmlinge genau das vor, was ihr ihnen zeigen möchtet. Dank verschiedener Rollen könnt ihr eure sensiblen Daten noch ein wenig zurückhalten und nur die Wikiseiten zur Verfügung stellen, die für einen Einstieg wirklich relevant sind.",
			},
			{
				label: "Gruppenchat",
				icon: "Onboarding_4.png",
				text: "Noch Fragen? Dann hilft vielleicht der Gruppenchat!",
			},
		],
	},
	{
		title: "Partyzeit!",
		steps: [
			{
				label: "Partyzeit!",
				icon: "Partyzeit_1.png",
				text: "Nach der Party ist vor der Party – erst recht für das Orgateam! Aber wie organisiert man Finanzen, Leute und Ablauf?",
			},
			{
				label: "Projektboard",
				icon: "Partyzeit_2.png",
				text: "Erstmal ein Projektboard in Univocal anlegen: Hier lassen sich übersichtlich ToDos und Zuständigkeiten sammeln und jederzeit erweitern, verschieben und ändern.",
			},
			{
				label: "Finanzen",
				icon: "Partyzeit_3.png",
				text: "Das Finanzentool regelt die finanzielle Seite – zumindest was die Übersicht angeht. Hier tragt ihr alle Einnahmen und Ausgaben ein, damit immer transparent ist, wer was gezahlt hat und niemand auf den Kosten sitzen bleibt.",
			},
		],
	},
	{
		title: "Gremienarbeit",
		steps: [
			{
				label: "Gremienarbeit",
				icon: "Gremienarbeit_1.png",
				text: "Die nächste Sitzung mit Professor*innen und Verwaltung steht an, aber ihr habt den Überblick über die alten Beschlüsse verloren?",
			},
			{
				label: "Wiki & Protokolle",
				icon: "Gremienarbeit_2.png",
				text: "Schlage einfach im Wiki nach! Hier findet ihr alle Protokolle und Entscheidungen vergangener Sitzungen an einem zentralen Ort. So seid ihr bestens vorbereitet und wisst genau, was letztes Semester vereinbart wurde.",
			},
			{
				label: "Gruppenchat",
				icon: "Gremienarbeit_3.png",
				text: "Während der Sitzung müsst ihr euch kurz untereinander abstimmen? Über den Gruppenchat könnt ihr eure Strategie in Echtzeit koordinieren und euch diskret Feedback geben, ohne den Sitzungsfluss zu stören.",
			},
			{
				label: "Projektboard",
				icon: "Gremienarbeit_4.png",
				text: "Nach der Sitzung ist vor der Umsetzung: Im Projektboard haltet ihr direkt fest, welche Aufgaben aus den Beschlüssen resultieren und euer Protokoll landet im Wiki – wenn nicht sowieso schon in der Sitzung passiert. So stellt ihr sicher, dass die studentische Stimme auch zwischen den Terminen aktiv bleibt und nichts untergeht.",
			},
		],
	},
];

export const ASTA_USE_CASES: UseCase[] = [
	{
		title: "Transparente Haushaltsführung",
		steps: [
			{
				label: "Haushaltsführung",
				icon: "Haushalt_1.png",
				text: "Der AStA-Haushalt umfasst zahlreiche Posten – hier den Überblick zu behalten und sauber zu dokumentieren, ist für die Finanzreferent*innen essenziell.",
			},
			{
				label: "Budgetplanung",
				icon: "Haushalt_2.png",
				text: "Zu Beginn der Legislatur legt ihr den gesamten Haushaltsplan im Finanztool von Univocal an. Ihr erstellt dedizierte Töpfe für die verschiedenen Referate und Projekte, sodass die grundlegende Struktur direkt digital abgebildet ist.",
			},
			{
				label: "Verwaltungswissen zum Nachschlagen",
				icon: "Haushalt_3.png",
				text: "Anleitungen für die verschiedenen Prozesse zur Budgetierung lassen sich im Wiki speichern und abrufen. So behaltet ihr und alle eure zukünftigen Nachfolger*innen immer den Überblick und eine saubere Arbeitsweise bei.",
			},
		],
	},
	{
		title: "Studierenden-Stimmungsbilder",
		steps: [
			{
				label: "Hochschulpolitik",
				icon: "Stimmungsbilder_1.png",
				text: "Eure Univerwaltung plant Änderungen an der Prüfungsordnung, aber euch fehlt ein belastbares Meinungsbild der Basis?",
			},
			{
				label: "Umfragetool",
				icon: "Stimmungsbilder_2.png",
				text: "Mit Univocal erstellt ihr zügig differenzierte Fragebögen zu kritischen Themen. Dank verschiedener Antwortformate bekommt ihr genau das Feedback, das ihr für eure Argumentation braucht.",
			},
			{
				label: "Single-Sign-On",
				icon: "Stimmungsbilder_3.png",
				text: "Über den SSO-Login ist sichergestellt, dass nur immatrikulierte Studis abstimmen. Das System garantiert Anonymität und schließt Mehrfachabstimmungen verlässlich aus.",
			},
			{
				label: "Auswertung",
				icon: "Stimmungsbilder_4.png",
				text: "Die Ergebnisse werden in Echtzeit grafisch aufbereitet. So könnt ihr eure Forderungen in der nächsten Senatssitzung direkt mit harten Fakten und exportierbaren Diagrammen untermauern.",
			},
		],
	},
	{
		title: "Terminkoordination",
		steps: [
			{
				label: "Terminkoordination",
				icon: "Terminkoordination_1.png",
				text: "Plenum, Beratungstermine und Campusfest – bei der Vielzahl an Terminen verliert ihr langsam den Überblick?",
			},
			{
				label: "Zentraler Kalender",
				icon: "Terminkoordination_2.png",
				text: "Im Master-Kalender bündelt ihr alle Events an einem Ort. Dank Kategorien und Filtern behalten alle Referate den Durchblick und Raumkonflikte gehören der Vergangenheit an.",
			},
			{
				label: "Events",
				icon: "Terminkoordination_3.png",
				text: "Für eure Angebote mit begrenzter Teilnehmendenzahl richtet ihr einfach buchbare Plätze über das Eventtool ein. Studierende können sich ihren Termin mit einem Klick selbst sichern – das spart Wartezeit und Planungsaufwand.",
			},
		],
	},
];

export const GREMIEN_USE_CASES: UseCase[] = [
	{
		title: "Produktive AGs",
		steps: [
			{
				label: "Arbeitsgruppe",
				icon: "ProduktiveAGs_1.png",
				text: "Ihr wollt Prozesse in der Verwaltung oder Lehre optimieren, aber die verschiedenen Abteilungen lassen sich einfach nicht so recht koordinieren?",
			},
			{
				label: "Umfragetool",
				icon: "ProduktiveAGs_2.png",
				text: "Erstellt strukturierte Bedarfsanalysen oder Feedback-Umfragen zu neuen Workflows. So erhaltet ihr ein repräsentatives Stimmungsbild aus der gesamten Belegschaft – ein gewöhnlicher Hochschulzugang reicht für den Single-Sign-On.",
			},
			{
				label: "Echtzeit-Auswertung",
				icon: "ProduktiveAGs_3.png",
				text: "Die Ergebnisse werden sofort visualisiert. Das liefert euch die perfekte Argumentationsgrundlage für das nächste Gespräch mit dem Rektorat, Präsidium, Dekanat oder der Kanzlerin, untermauert durch klare Daten.",
			},
			{
				label: "Wiki-Dokumentation",
				icon: "ProduktiveAGs_4.png",
				text: "Die beschlossenen Maßnahmen und neuen Standards landen direkt im Wiki, damit die Umsetzung für alle beteiligten Stellen transparent und nachvollziehbar bleibt.",
			},
		],
	},
	{
		title: "Personalrat & Mittelbau-Vertretung",
		steps: [
			{
				label: "Personalrat",
				icon: "Personalrat_1.png",
				text: "Ihr müsst die Interessen der Kolleg*innen wahren, aber die rechtlichen Grundlagen sind komplex und die Beratungstermine ständig ausgebucht?",
			},
			{
				label: "Wiki-Wissensbasis",
				icon: "Personalrat_2.png",
				text: "Speichert Leitfäden zu Arbeitsrecht, Dienstvereinbarungen und Befristungsregeln im Wiki. Neue Mitglieder in der Vertretung arbeiten sich so blitzschnell ein und können fundiert Auskunft geben.",
			},
			{
				label: "Zugangsverwaltung",
				icon: "Personalrat_3.png",
				text: "Dank SSO und Rollenverteilung stellt ihr sicher, dass sensible Protokolle aus Verhandlungen mit der Hochschulleitung nur für den gewählten Kern der Vertretung einsehbar bleiben.",
			},
		],
	},
	{
		title: "Tagungsorganisation",
		steps: [
			{
				label: "Symposium",
				icon: "Tagungsorganisation_1.png",
				text: "Das nächste wissenschaftliche Symposium steht an – von der Raumplanung bis zum Call for Papers muss alles perfekt ineinandergreifen.",
			},
			{
				label: "Master-Kalender",
				icon: "Tagungsorganisation_2.png",
				text: "Koordiniert Keynotes, Panel-Sessions und Kaffeepausen im zentralen Kalender. So vermeidet ihr Überschneidungen mit anderen großen Fakultätsterminen und behaltet die Raumbelegung im Griff.",
			},
			{
				label: "Anmeldemanagement",
				icon: "Tagungsorganisation_3.png",
				text: "Referierende und Gäste melden sich unkompliziert über Univocal an. Ihr behaltet mit dem Eventtool jederzeit den Überblick über Teilnehmendenzahlen und habt die Gästeliste automatisch für den Check-in parat. Mit dem einfachen Umfragetool lassen sich auch Details wie beispielsweise Cateringpräferenzen mühelos abfragen.",
			},
			{
				label: "Projektboard",
				icon: "Tagungsorganisation_4.png",
				text: "Von der Technik-Checkliste bis zur Hotelbuchung für Gastredner*innen – im Board weist ihr Aufgaben zu und hakt den Fortschritt gemeinsam im Orga-Team ab.",
			},
		],
	},
];
