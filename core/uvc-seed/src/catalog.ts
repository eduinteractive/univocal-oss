import { Types } from "mongoose";
import { ids, oid } from "./ids";
import { SeedDoc } from "./db";

const b64 = (value: string) => Buffer.from(value, "utf8").toString("base64");

const field = (name: string, type: string, options: string[] = []) => ({
    key: b64(name),
    value: [type, ...options].map(b64).join("."),
});

const at = (dayOffset: number, hours = 10, minutes = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const meta = (
    id: Types.ObjectId,
    title: string,
    description: string,
    authorId: Types.ObjectId,
    viewAccess: number,
    createdAt: Date
) => ({
    _id: id,
    tenantId: ids.tenant,
    authorId,
    title,
    description,
    viewAccess,
    createdAt,
    updatedAt: createdAt,
});

export const DEMO_PASSWORD = "Demo1234!";

export interface DemoAccount {
    role: string;
    mail: string;
    group: string;
}

export const demoAccounts: DemoAccount[] = [
    { role: "Admin", mail: "admin@fachschaft.demo", group: "Admin" },
    { role: "Moderator", mail: "moderation@fachschaft.demo", group: "Moderator" },
    { role: "Mitglied", mail: "mitglied@fachschaft.demo", group: "Mitglied" },
    { role: "Gast", mail: "gast@fachschaft.demo", group: "Gast" },
    { role: "Anfrage", mail: "anfrage@fachschaft.demo", group: "keine Gruppe" },
];

const membership = (permissionLevel: number, badges?: string[]) => ({
    _id: ids.tenant,
    permissionLevel,
    ...(badges ? { badges } : {}),
});

const user = (
    id: Types.ObjectId,
    contactId: Types.ObjectId,
    mail: string,
    passwordHash: string,
    groups: ReturnType<typeof membership>[],
    registered: Date
): SeedDoc => ({
    _id: id,
    mail,
    password: passwordHash,
    permissionLevel: 1,
    groups,
    domains: [ids.domain],
    dataProtectionAgreement: true,
    activationStatus: "ACTIVATED",
    authProvider: "LOCAL",
    lastSignDate: at(0, 9),
    registerDate: registered,
    contact: contactId,
    devices: [],
});

const contact = (id: Types.ObjectId, firstName: string, lastName: string): SeedDoc => ({
    _id: id,
    first_name: firstName,
    last_name: lastName,
});

export interface SeedCatalog {
    auth: { contacts: SeedDoc[]; users: SeedDoc[] };
    tenant: { domains: SeedDoc[]; tenants: SeedDoc[]; invitations: SeedDoc[]; notifications: SeedDoc[]; requests: SeedDoc[]; budgets: SeedDoc[]; positions: SeedDoc[]; receipts: SeedDoc[] };
    profile: { profiles: SeedDoc[]; news: SeedDoc[]; projects: SeedDoc[]; supportRequests: SeedDoc[]; supportResponses: SeedDoc[] };
    calendar: { events: SeedDoc[] };
    event: { events: SeedDoc[]; registrations: SeedDoc[]; attendees: SeedDoc[] };
    knowledge: { wikis: SeedDoc[]; sections: SeedDoc[]; groups: SeedDoc[]; contacts: SeedDoc[] };
    survey: { metas: SeedDoc[]; components: SeedDoc[]; results: SeedDoc[] };
    project: { projects: SeedDoc[]; tasks: SeedDoc[] };
    chat: { groupMessages: SeedDoc[]; privateMessages: SeedDoc[] };
    statistics: { timeSeries: SeedDoc[]; landingDaily: SeedDoc[] };
}

export const buildCatalog = (passwordHash: string): SeedCatalog => {
    const studyField = field("Studiengang", "text");
    const cateringField = field("Verpflegung", "single_choice", ["Vegetarisch", "Vegan", "Keine Angabe"]);
    const shirtField = field("T-Shirt Größe", "text");

    const publishedStart = at(1, 18);
    const publishedEnd = at(1, 22);

    return {
        auth: {
            contacts: [
                contact(ids.adminContact, "Lena", "Hartmann"),
                contact(ids.moderatorContact, "Jonas", "Keller"),
                contact(ids.memberContact, "Mara", "Vogel"),
                contact(ids.guestContact, "Tim", "Berger"),
                contact(ids.requesterContact, "Aylin", "Demir"),
            ],
            users: [
                user(ids.admin, ids.adminContact, "admin@fachschaft.demo", passwordHash, [membership(3)], at(-400)),
                user(ids.moderator, ids.moderatorContact, "moderation@fachschaft.demo", passwordHash, [membership(2, ["Finanzen", "Öffentlichkeit"])], at(-320)),
                user(ids.member, ids.memberContact, "mitglied@fachschaft.demo", passwordHash, [membership(1)], at(-180)),
                user(ids.guest, ids.guestContact, "gast@fachschaft.demo", passwordHash, [membership(0)], at(-20)),
                user(ids.requester, ids.requesterContact, "anfrage@fachschaft.demo", passwordHash, [], at(-2)),
            ],
        },
        tenant: {
            domains: [{
                _id: ids.domain,
                title: "Universität Demo",
                shortcode: "DEMO",
                idpIdentifier: "demo.univocal.test",
            }],
            tenants: [{
                _id: ids.tenant,
                title: "Fachschaft Informatik",
                description: "Die Fachschaft Informatik vertritt die Studierenden, organisiert die Erstsemesterwoche und hält die Sprechstunde im Foyer.",
                domain: ids.domain,
                visibility: "PUBLIC",
                integrations: {
                    dashboard: true,
                    documentation: true,
                    calendar: true,
                    survey: true,
                    chat: true,
                    budget: true,
                    knowledge: true,
                    event: true,
                    project: true,
                },
            }],
            invitations: [{
                _id: ids.invitation,
                tenant: ids.tenant,
                mail: "neue-person@fachschaft.demo",
                date: at(-1, 14),
                status: "PENDING",
                permissionLevel: 1,
            }],
            notifications: [{
                _id: ids.notification,
                tenantId: ids.tenant,
                authorId: ids.admin,
                type: "INFO",
                content: "Die Sprechstunde findet diese Woche im Foyer statt. Wer Material für die Erstsemesterwoche hat, legt es bis Freitag ins Fachschaftsbüro.",
                creationDate: at(-1, 8, 30),
                seenBy: [ids.admin, ids.moderator],
            }],
            requests: [{
                _id: ids.request,
                tenant: ids.tenant,
                requesterId: ids.requester,
                mail: "anfrage@fachschaft.demo",
                date: at(-2, 16),
                status: "PENDING",
            }],
            budgets: [{
                ...meta(ids.budget, "Haushaltsplan 2026", "Einnahmen aus dem Semesterbeitrag und Ausgaben für Veranstaltungen.", ids.moderator, 2, at(-40)),
                category: "Fachschaft",
                ist_active: true,
                receipt_active: true,
            }],
            positions: [{
                _id: ids.positionIncomeGroup,
                budgetId: ids.budget,
                title: "Einnahmen",
                description: "Beiträge des Semesters.",
                type: "GROUP_INCOME",
                soll_amount: 0,
                ist_amount: 0,
                without_assignment: false,
                createdAt: at(-40),
                updatedAt: at(-40),
            }, {
                _id: ids.positionIncome,
                budgetId: ids.budget,
                parent: ids.positionIncomeGroup,
                title: "Semesterbeitrag",
                description: "Anteil der Fachschaft am Semesterbeitrag.",
                type: "INCOME",
                soll_amount: 4200,
                ist_amount: 2100,
                without_assignment: false,
                createdAt: at(-40),
                updatedAt: at(-5),
            }, {
                _id: ids.positionExpenseGroup,
                budgetId: ids.budget,
                title: "Ausgaben",
                description: "Veranstaltungen und Büro.",
                type: "GROUP_EXPENSE",
                soll_amount: 0,
                ist_amount: 0,
                without_assignment: false,
                createdAt: at(-40),
                updatedAt: at(-40),
            }, {
                _id: ids.positionExpense,
                budgetId: ids.budget,
                parent: ids.positionExpenseGroup,
                title: "Erstsemesterwoche",
                description: "Getränke, Druckkosten und Raum.",
                type: "EXPENSE",
                soll_amount: 900,
                ist_amount: 186,
                without_assignment: false,
                createdAt: at(-40),
                updatedAt: at(-3),
            }],
            receipts: [{
                _id: ids.receipt,
                positionId: ids.positionExpense,
                amount: 186,
                description: "Getränke für die Begrüßung, bar bezahlt im Foyer.",
                date: at(-3, 19),
                file: null,
                createdAt: at(-3, 19, 30),
                updatedAt: at(-3, 19, 30),
            }],
        },
        profile: {
            profiles: [{
                _id: ids.profile,
                tenantId: ids.tenant,
                description: "Wir sind die Fachschaft Informatik. Bei uns bekommst du Hilfe zur Studienordnung, zur Erstsemesterwoche und zu allem, was zwischen Vorlesung und Prüfung liegt.",
                contactPerson: "Lena Hartmann",
                contactEmail: "admin@fachschaft.demo",
                contactPhone: "+49 30 123456",
                contactWebsite: "https://fachschaft.demo",
                publicPerson: "Lena Hartmann",
                site: {
                    subdomain: "fachschaft",
                    published: true,
                    galleryImages: [],
                    seoTitle: "Fachschaft Informatik",
                    seoDescription: "Sprechstunde, Erstsemesterwoche und aktuelle Umfragen der Fachschaft Informatik.",
                    appearance: { palette: "campus-navy", layout: "magazine" },
                    socialLinks: { instagram: "https://instagram.com/fachschaft.demo" },
                    legal: {
                        imprint: {
                            mode: "text",
                            text: "<p>Fachschaft Informatik<br>Musterstraße 1<br>10115 Berlin<br>admin@fachschaft.demo</p>",
                        },
                        privacy: {
                            mode: "text",
                            text: "<p>Anmeldungen und Check-ins speichern Name und E-Mail nur für die jeweilige Veranstaltung. Die Daten werden nach dem Semester gelöscht.</p>",
                        },
                    },
                    sections: [
                        { type: "BOARD", enabled: true, featuredIds: [ids.newsPublished.toString(), ids.profileProject.toString()] },
                        { type: "EVENTS", enabled: true, featuredIds: [ids.eventPublished.toString()] },
                        { type: "SURVEYS", enabled: true, featuredIds: [ids.surveyOpen.toString()] },
                        { type: "SUPPORT", enabled: true, featuredIds: [ids.supportRequest.toString()] },
                    ],
                },
            }],
            news: [{
                _id: ids.newsPublished,
                tenantId: ids.tenant,
                authorId: ids.moderator,
                title: "Sprechstunde ab nächster Woche im Foyer",
                content: "<p>Mittwoch von 12 bis 14 Uhr sitzen wir im Foyer. Bringt Fragen zur Prüfungsordnung einfach mit.</p>",
                status: "PUBLISHED",
                publishDate: at(-6, 9),
                createdAt: at(-7),
                updatedAt: at(-6, 9),
            }, {
                _id: ids.newsDraft,
                tenantId: ids.tenant,
                authorId: ids.admin,
                title: "Entwurf: Grillabend nach der Klausurphase",
                content: "<p>Noch nicht veröffentlichen. Datum und Ort fehlen.</p>",
                status: "DRAFT",
                createdAt: at(-1),
                updatedAt: at(-1),
            }],
            projects: [{
                _id: ids.profileProject,
                tenantId: ids.tenant,
                authorId: ids.member,
                title: "Lernraum am Wochenende",
                content: "<p>Wir schließen den Seminarraum samstags auf, damit Lerngruppen einen Platz haben. Schlüssel im Fachschaftsbüro.</p>",
                status: "PUBLISHED",
                publishDate: at(-12, 11),
                createdAt: at(-14),
                updatedAt: at(-12, 11),
            }],
            supportRequests: [{
                _id: ids.supportRequest,
                tenantId: ids.tenant,
                authorId: ids.guest,
                title: "Protokoll der letzten Sitzung",
                description: "Ich habe die Sitzung verpasst. Liegt das Protokoll irgendwo, oder kann es mir jemand schicken?",
                status: "PUBLISHED",
                publishDate: at(-4, 15),
                createdAt: at(-4, 15),
                updatedAt: at(-4, 15),
            }],
            supportResponses: [{
                _id: ids.supportResponse,
                tenantId: ids.tenant,
                requestId: ids.supportRequest,
                kind: "OFFER",
                name: "Jonas Keller",
                email: "moderation@fachschaft.demo",
                message: "Das Protokoll liegt im Wiki unter Sitzungen. Ich habe dir den Abschnitt verlinkt.",
                status: "OPEN",
                createdAt: at(-3, 10),
                updatedAt: at(-3, 10),
            }],
        },
        calendar: {
            events: [
                {
                    ...meta(ids.calendarPast, "Fachschaftssitzung", "Beschluss zur Erstsemesterwoche und zum Haushaltsplan.", ids.admin, 0, at(-10)),
                    location: "Raum A102",
                    startDate: at(-8, 18),
                    endDate: at(-8, 20),
                    notes: "Protokoll liegt im Wiki.",
                    color: "#7950f2",
                    materials: [],
                },
                {
                    ...meta(ids.calendarToday, "Sprechstunde", "Offene Fragen zur Studienordnung.", ids.member, 0, at(-2)),
                    location: "Foyer",
                    startDate: at(0, 12),
                    endDate: at(0, 14),
                    notes: "",
                    color: "#12b886",
                    materials: [],
                },
                {
                    ...meta(ids.calendarSpan, "Erstsemesterwoche", "Begrüßung, Campusrundgang und Fachschaftsabend.", ids.admin, 0, at(-20)),
                    location: "Campus",
                    startDate: at(3, 9),
                    endDate: at(7, 22),
                    notes: "Programm steht in der Veranstaltung.",
                    color: "#228be6",
                    materials: [],
                },
                {
                    ...meta(ids.calendarModerators, "Haushaltsbesprechung", "Nur für Moderation und Verwaltung.", ids.moderator, 2, at(-1)),
                    location: "Büro",
                    startDate: at(2, 16),
                    endDate: at(2, 17),
                    notes: "Belege zur Erstsemesterwoche mitbringen.",
                    color: "#e64980",
                    materials: [],
                },
            ],
        },
        event: {
            events: [
                {
                    ...meta(
                        ids.eventPublished,
                        "Begrüßung der Erstsemester",
                        "Der Abend zum Start der Erstsemesterwoche. Danach gibt es noch Zeit für Fragen im Foyer.",
                        ids.member,
                        0,
                        at(-15)
                    ),
                    startDate: publishedStart,
                    endDate: publishedEnd,
                    place: { name: "Hörsaal 1", address: "Musterstraße 1, 10115 Berlin" },
                    config: {
                        toc: {
                            enabled: true,
                            content: "",
                            materials: [],
                            sessions: [
                                {
                                    id: "seed-session-welcome",
                                    title: "Ankommen",
                                    start: at(1, 18),
                                    end: at(1, 18, 20),
                                    place: "Foyer",
                                    description: "<p>Namensschilder und ein erster Überblick über den Abend.</p>",
                                },
                                {
                                    id: "seed-session-talk",
                                    title: "Was die Fachschaft macht",
                                    start: at(1, 18, 30),
                                    end: at(1, 19, 15),
                                    place: "Hörsaal 1",
                                    description: "<p>Sprechstunde, Gremien und wie man sich einbringt.</p>",
                                },
                                {
                                    id: "seed-session-questions",
                                    title: "Fragen und Ausklang",
                                    start: at(1, 19, 30),
                                    end: publishedEnd,
                                    place: "Foyer",
                                    description: "",
                                },
                            ],
                        },
                        registration: {
                            enabled: true,
                            capacity: 80,
                            fields: [studyField, cateringField],
                        },
                        accreditation: {
                            enabled: true,
                            fields: [shirtField],
                        },
                        public: {
                            coverKey: "",
                            accent: "campus-navy",
                            layout: "magazine",
                            published: true,
                        },
                    },
                },
                {
                    ...meta(ids.eventDraft, "Grillabend", "Entwurf für den Abend nach der Klausurphase.", ids.admin, 1, at(-1)),
                    startDate: at(21, 17),
                    endDate: at(21, 22),
                    place: { name: "Innenhof", address: "Musterstraße 1, 10115 Berlin" },
                    config: {
                        toc: { enabled: false, content: "", materials: [], sessions: [] },
                        registration: { enabled: true, capacity: 40, fields: [] },
                        accreditation: { enabled: false, fields: [] },
                        public: { coverKey: "", accent: "univocal", layout: "compact", published: false },
                    },
                },
                {
                    ...meta(ids.eventProgram, "Campusrundgang", "Treffpunkt am Haupteingang. Eine Anmeldung ist nicht nötig.", ids.moderator, 0, at(-9)),
                    startDate: at(4, 11),
                    endDate: at(4, 13),
                    place: { name: "Haupteingang", address: "Musterstraße 1, 10115 Berlin" },
                    config: {
                        toc: {
                            enabled: true,
                            content: "",
                            materials: [],
                            sessions: [{
                                id: "seed-session-tour",
                                title: "Rundgang",
                                start: at(4, 11),
                                end: at(4, 13),
                                place: "Campus",
                                description: "<p>Bibliothek, Mensa und die wichtigsten Hörsäle.</p>",
                            }],
                        },
                        registration: { enabled: false, capacity: null, fields: [] },
                        accreditation: { enabled: false, fields: [] },
                        public: { coverKey: "", accent: "forest", layout: "compact", published: true },
                    },
                },
            ],
            registrations: [
                {
                    _id: ids.registrationA,
                    eventId: ids.eventPublished,
                    personal: { firstName: "Sara", lastName: "Nguyen", email: "sara.nguyen@fachschaft.demo" },
                    customFields: { [studyField.key]: "Informatik", [cateringField.key]: b64("Vegetarisch") },
                    createdAt: at(-5, 11),
                    updatedAt: at(-5, 11),
                },
                {
                    _id: ids.registrationB,
                    eventId: ids.eventPublished,
                    personal: { firstName: "Paul", lastName: "Weiß", email: "paul.weiss@fachschaft.demo" },
                    customFields: { [studyField.key]: "Wirtschaftsinformatik", [cateringField.key]: b64("Keine Angabe") },
                    createdAt: at(-4, 16),
                    updatedAt: at(-4, 16),
                },
                {
                    _id: ids.registrationC,
                    eventId: ids.eventPublished,
                    personal: { firstName: "Noor", lastName: "Saleh", email: "noor.saleh@fachschaft.demo" },
                    customFields: { [studyField.key]: "Informatik", [cateringField.key]: b64("Vegan") },
                    createdAt: at(-2, 9),
                    updatedAt: at(-2, 9),
                },
            ],
            attendees: [
                {
                    _id: ids.attendeeA,
                    eventId: ids.eventPublished,
                    personal: { firstName: "Sara", lastName: "Nguyen", email: "sara.nguyen@fachschaft.demo" },
                    customFields: { [shirtField.key]: "M" },
                },
                {
                    _id: ids.attendeeB,
                    eventId: ids.eventPublished,
                    personal: { firstName: "Paul", lastName: "Weiß", email: "paul.weiss@fachschaft.demo" },
                    customFields: { [shirtField.key]: "L" },
                },
            ],
        },
        knowledge: {
            wikis: [{
                ...meta(ids.wiki, "Fachschaftswiki", "Interne Notizen für Sitzungen und das Büro.", ids.admin, 1, at(-200)),
                tableOfContents: [
                    { title: "Willkommen", sectionId: ids.wikiSectionWelcome, children: [] },
                    { title: "Sitzungen", sectionId: ids.wikiSectionMeeting, children: [] },
                ],
            }],
            sections: [{
                _id: ids.wikiSectionWelcome,
                wikiId: ids.wiki,
                title: "Willkommen",
                type: "editor",
                content: "<p>Hier liegt, was die Fachschaft zwischen den Sitzungen braucht: Schlüssel, Sprechstunde und wer wofür zuständig ist.</p>",
                materials: [],
            }, {
                _id: ids.wikiSectionMeeting,
                wikiId: ids.wiki,
                title: "Letzte Sitzung",
                type: "editor",
                content: "<p>Beschlossen: Die Begrüßung bleibt im Hörsaal 1. Der Haushaltsplan 2026 wird in der nächsten Moderation noch einmal gegen die Belege geprüft.</p>",
                materials: [],
            }],
            groups: [{
                ...meta(ids.contactGroup, "Hochschule", "Ansprechpartnerinnen und Ansprechpartner außerhalb der Fachschaft.", ids.admin, 0, at(-100)),
            }],
            contacts: [{
                _id: ids.contactOffice,
                contactGroupIds: [ids.contactGroup],
                title: "Prüfungsamt",
                firstName: "Karin",
                lastName: "Ost",
                email: "pruefungsamt@fachschaft.demo",
                phone: "+49 30 123400",
                description: "Fristen und Anerkennung.",
                street: "Musterstraße 2",
                zip: "10115",
                city: "Berlin",
                createdAt: at(-100),
                updatedAt: at(-100),
            }, {
                _id: ids.contactDean,
                contactGroupIds: [ids.contactGroup],
                title: "Dekanat",
                firstName: "Prof. Dr. Henrik",
                lastName: "Baum",
                email: "dekanat@fachschaft.demo",
                phone: "+49 30 123401",
                description: "Für Gremien und Raumfragen.",
                street: "Musterstraße 3",
                zip: "10115",
                city: "Berlin",
                createdAt: at(-90),
                updatedAt: at(-90),
            }],
        },
        survey: {
            metas: [
                {
                    ...meta(ids.surveyOpen, "Mensa und Lernräume", "Kurze anonyme Umfrage für die nächste Sitzung.", ids.moderator, 0, at(-8)),
                    options: {
                        executionMode: "ANONYMOUS",
                        tans: [],
                        isActive: true,
                        startDate: at(-7, 8),
                        endDate: at(14, 23, 59),
                        redirectionUrl: null,
                        resultsSharing: false,
                        showQuestionNumbers: true,
                    },
                },
                {
                    ...meta(ids.surveyScheduled, "Evaluation Erstsemesterwoche", "Startet nach der Begrüßung.", ids.admin, 0, at(-3)),
                    options: {
                        executionMode: "ANONYMOUS",
                        tans: [],
                        isActive: true,
                        startDate: at(8, 9),
                        endDate: at(21, 18),
                        redirectionUrl: null,
                        resultsSharing: false,
                        showQuestionNumbers: true,
                    },
                },
                {
                    ...meta(ids.surveyClosed, "Rückblick Wintersemester", "Abgeschlossen. Die Ergebnisse sind für die Gruppe sichtbar.", ids.admin, 1, at(-60)),
                    options: {
                        executionMode: "DEFAULT",
                        tans: [],
                        isActive: false,
                        startDate: at(-50, 9),
                        endDate: at(-20, 18),
                        redirectionUrl: null,
                        resultsSharing: true,
                        showQuestionNumbers: true,
                    },
                },
            ],
            components: [
                {
                    _id: ids.surveyOpenChoice,
                    surveyId: ids.surveyOpen,
                    title: "Wo lernst du am liebsten?",
                    required: true,
                    next: ids.surveyOpenText,
                    type: "CHOICE",
                    choices: ["Bibliothek", "Seminarraum", "Zu Hause"],
                    multiple: false,
                    createdAt: at(-8),
                    updatedAt: at(-8),
                },
                {
                    _id: ids.surveyOpenText,
                    surveyId: ids.surveyOpen,
                    title: "Was fehlt dir auf dem Campus?",
                    required: false,
                    previous: ids.surveyOpenChoice,
                    type: "OPEN",
                    createdAt: at(-8),
                    updatedAt: at(-8),
                },
                {
                    _id: ids.surveyScheduledText,
                    surveyId: ids.surveyScheduled,
                    title: "Was sollen wir nächstes Jahr anders machen?",
                    required: false,
                    type: "OPEN",
                    createdAt: at(-3),
                    updatedAt: at(-3),
                },
                {
                    _id: ids.surveyClosedChoice,
                    surveyId: ids.surveyClosed,
                    title: "Wie war die Sprechstunde?",
                    required: true,
                    type: "CHOICE",
                    choices: ["Hat mir geholfen", "Okay", "Ich war nicht da"],
                    multiple: false,
                    createdAt: at(-60),
                    updatedAt: at(-60),
                },
            ],
            results: [
                {
                    _id: ids.surveyResultA,
                    surveyId: ids.surveyOpen,
                    personal: {},
                    answers: [
                        { key: ids.surveyOpenChoice.toString(), value: "Bibliothek" },
                        { key: ids.surveyOpenText.toString(), value: "Mehr Steckdosen im Foyer." },
                    ],
                    createdAt: at(-5, 13),
                    updatedAt: at(-5, 13),
                },
                {
                    _id: ids.surveyResultB,
                    surveyId: ids.surveyOpen,
                    personal: {},
                    answers: [
                        { key: ids.surveyOpenChoice.toString(), value: "Seminarraum" },
                        { key: ids.surveyOpenText.toString(), value: "Der Lernraum am Wochenende sollte früher aufschließen." },
                    ],
                    createdAt: at(-3, 18),
                    updatedAt: at(-3, 18),
                },
                {
                    _id: ids.surveyResultC,
                    surveyId: ids.surveyOpen,
                    personal: {},
                    answers: [{ key: ids.surveyOpenChoice.toString(), value: "Zu Hause" }],
                    createdAt: at(-1, 21),
                    updatedAt: at(-1, 21),
                },
                {
                    _id: ids.surveyResultD,
                    surveyId: ids.surveyClosed,
                    personal: { identifier: "mitglied@fachschaft.demo" },
                    answers: [{ key: ids.surveyClosedChoice.toString(), value: "Hat mir geholfen" }],
                    createdAt: at(-30, 12),
                    updatedAt: at(-30, 12),
                },
                {
                    _id: ids.surveyResultE,
                    surveyId: ids.surveyClosed,
                    personal: { identifier: "gast@fachschaft.demo" },
                    answers: [{ key: ids.surveyClosedChoice.toString(), value: "Ich war nicht da" }],
                    createdAt: at(-25, 17),
                    updatedAt: at(-25, 17),
                },
            ],
        },
        project: {
            projects: [{
                ...meta(ids.project, "Erstsemesterwoche vorbereiten", "Offene Aufgaben bis zur Begrüßung.", ids.admin, 1, at(-18)),
                columns: [
                    { _id: ids.columnOpen, title: "Offen", tasks: [ids.taskOverdue] },
                    { _id: ids.columnDoing, title: "In Arbeit", tasks: [ids.taskWithSubtask] },
                    { _id: ids.columnDone, title: "Erledigt", tasks: [] },
                ],
            }],
            tasks: [{
                _id: ids.taskOverdue,
                title: "Namensschilder drucken",
                description: "Vorlage liegt im Wiki. Druck im Copyshop neben der Mensa.",
                subtasks: [],
                dueDate: at(-1, 17),
                color: "#fa5252",
                owner: ids.member,
                connectors: [],
                materials: [],
                createdAt: at(-12),
                updatedAt: at(-2),
            }, {
                _id: ids.taskWithSubtask,
                title: "Ablauf mit dem Hörsaal abstimmen",
                description: "Technik und Bestuhlung für die Begrüßung.",
                subtasks: [{
                    _id: ids.subtask,
                    title: "Mikrofon reservieren",
                    description: "Beim Dekanat anfragen.",
                    dueDate: at(0, 15),
                    owner: ids.moderator,
                    done: false,
                }],
                dueDate: at(1, 12),
                color: "#fab005",
                owner: ids.moderator,
                connectors: [],
                materials: [],
                createdAt: at(-11),
                updatedAt: at(-1),
            }],
        },
        chat: {
            groupMessages: [
                {
                    _id: ids.groupMessageA,
                    authorId: ids.admin,
                    tenantId: ids.tenant,
                    content: "Können wir die Begrüßung eine Viertelstunde früher öffnen? Im Foyer staut es sich sonst.",
                    creationDate: at(-2, 9, 5),
                    seenBy: [ids.admin, ids.moderator, ids.member],
                    files: [],
                },
                {
                    _id: ids.groupMessageB,
                    authorId: ids.moderator,
                    tenantId: ids.tenant,
                    content: "Ja. Ich schreibe es ins Programm und passe die Anmeldung nicht an, die Uhrzeit der Veranstaltung bleibt.",
                    creationDate: at(-2, 9, 18),
                    seenBy: [ids.admin, ids.moderator],
                    files: [],
                },
                {
                    _id: ids.groupMessageC,
                    authorId: ids.member,
                    tenantId: ids.tenant,
                    content: "Namensschilder sind bestellt. Abholung morgen nach der Sprechstunde.",
                    creationDate: at(-1, 13, 40),
                    seenBy: [ids.member],
                    files: [],
                },
                {
                    _id: ids.groupMessageD,
                    authorId: ids.guest,
                    tenantId: ids.tenant,
                    content: "Ich kann am Empfang aushelfen, wenn noch jemand fehlt.",
                    creationDate: at(0, 8, 10),
                    seenBy: [ids.guest],
                    files: [],
                },
            ],
            privateMessages: [
                {
                    _id: ids.privateMessageA,
                    authorId: ids.admin,
                    recipientId: ids.member,
                    content: "Kannst du die Namensschilder wirklich bis morgen abholen? Sonst springe ich ein.",
                    creationDate: at(-1, 14),
                    seen: true,
                    files: [],
                },
                {
                    _id: ids.privateMessageB,
                    authorId: ids.member,
                    recipientId: ids.admin,
                    content: "Passt. Ich lege sie danach ins Fachschaftsbüro.",
                    creationDate: at(-1, 14, 12),
                    seen: false,
                    files: [],
                },
            ],
        },
        statistics: {
            timeSeries: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
                _id: oid(200 + day),
                metric: "landing_page_campaign_seed-fachschaft",
                timestamp: at(-6 + day, 0),
                value: 12 + day * 3,
            })),
            landingDaily: [0, 1, 2, 3, 4, 5, 6].flatMap((day) => {
                const timestamp = at(-6 + day, 0);
                const dims = {
                    path: "/",
                    cta: "",
                    morigin: "",
                    referrer: "",
                    country: "DE",
                    device: "desktop",
                    key: "uvc-seed",
                    bucket: "",
                };
                return [
                    { _id: oid(220 + day), metric: "page_view", timestamp, value: 40 + day * 5, dims },
                    { _id: oid(230 + day), metric: "unique_visitor", timestamp, value: 18 + day * 2, dims: { ...dims, key: "uvc-seed-unique" } },
                    { _id: oid(240 + day), metric: "cta_click", timestamp, value: 4 + day, dims: { ...dims, cta: "demo", key: "uvc-seed-cta" } },
                ];
            }),
        },
    };
};
