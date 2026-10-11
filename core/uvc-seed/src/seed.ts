import bcrypt from "bcryptjs";
import { Connection } from "mongoose";
import { DEMO_PASSWORD, DemoAccount, buildCatalog, demoAccounts } from "./catalog";
import { connectDatabase, deleteWhere, replaceDocs } from "./db";

export interface SeedResult {
    ok: true;
    password: string;
    tenantId: string;
    subdomain: string;
    accounts: DemoAccount[];
}

const withConnection = async <T>(database: string, write: (connection: Connection) => Promise<T>) => {
    const connection = await connectDatabase(database);
    try {
        return await write(connection);
    } finally {
        await connection.close();
    }
};

export const runSeed = async (): Promise<SeedResult> => {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const data = buildCatalog(passwordHash);

    await withConnection("uvc-auth", async (connection) => {
        await replaceDocs(connection, "usercontacts", data.auth.contacts);
        await replaceDocs(connection, "useraccounts", data.auth.users);
    });

    await withConnection("uvc-tenant", async (connection) => {
        await replaceDocs(connection, "domains", data.tenant.domains);
        await replaceDocs(connection, "tenants", data.tenant.tenants);
        await replaceDocs(connection, "tenantinvitations", data.tenant.invitations);
        await replaceDocs(connection, "tenantnotifications", data.tenant.notifications);
        await replaceDocs(connection, "tenantrequests", data.tenant.requests);
        await replaceDocs(connection, "budgets", data.tenant.budgets);
        await replaceDocs(connection, "budgetpositions", data.tenant.positions);
        await replaceDocs(connection, "budgetreceipts", data.tenant.receipts);
    });

    await withConnection("uvc-profile", async (connection) => {
        await replaceDocs(connection, "profiles", data.profile.profiles);
        await replaceDocs(connection, "news", data.profile.news);
        await replaceDocs(connection, "projects", data.profile.projects);
        await replaceDocs(connection, "profilesupportrequests", data.profile.supportRequests);
        await replaceDocs(connection, "profilesupportresponses", data.profile.supportResponses);
    });

    await withConnection("uvc-calendar", async (connection) => {
        await replaceDocs(connection, "calendarevents", data.calendar.events);
    });

    await withConnection("uvc-event", async (connection) => {
        await replaceDocs(connection, "svevents", data.event.events);
        await replaceDocs(connection, "eventregistrations", data.event.registrations);
        await replaceDocs(connection, "eventattendees", data.event.attendees);
    });

    await withConnection("uvc-knowledge", async (connection) => {
        await replaceDocs(connection, "wikis", data.knowledge.wikis);
        await replaceDocs(connection, "wikisections", data.knowledge.sections);
        await replaceDocs(connection, "contactgroups", data.knowledge.groups);
        await replaceDocs(connection, "contacts", data.knowledge.contacts);
    });

    await withConnection("uvc-survey", async (connection) => {
        await replaceDocs(connection, "surveymetas", data.survey.metas);
        await replaceDocs(connection, "surveycomponents", data.survey.components);
        await replaceDocs(connection, "surveyresults", data.survey.results);
    });

    await withConnection("uvc-project", async (connection) => {
        await replaceDocs(connection, "projects", data.project.projects);
        await replaceDocs(connection, "projecttasks", data.project.tasks);
    });

    await withConnection("uvc-chat", async (connection) => {
        await replaceDocs(connection, "groupmessages", data.chat.groupMessages);
        await replaceDocs(connection, "privatemessages", data.chat.privateMessages);
    });

    await withConnection("uvc-statistics", async (connection) => {
        await deleteWhere(connection, "timeseriesstats", { metric: "landing_page_campaign_seed-fachschaft" });
        await deleteWhere(connection, "landingdailystats", {
            "dims.key": { $in: ["uvc-seed", "uvc-seed-unique", "uvc-seed-cta"] },
        });
        await replaceDocs(connection, "timeseriesstats", data.statistics.timeSeries);
        await replaceDocs(connection, "landingdailystats", data.statistics.landingDaily);
    });

    return {
        ok: true,
        password: DEMO_PASSWORD,
        tenantId: data.tenant.tenants[0]._id.toString(),
        subdomain: "fachschaft",
        accounts: demoAccounts,
    };
};
