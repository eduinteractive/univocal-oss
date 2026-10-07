import axios from "axios";
import { BadRequestError } from "@eduinteractive/uvc-common";

interface EtherpadResponse<T> {
    code: number;
    message: string;
    data: T | null;
}

const internalUrl = () => (process.env.ETHERPAD_INTERNAL_URL || "http://uvc-etherpad-srv:9001").replace(/\/$/, "");

const requireConfig = () => {
    if (!process.env.ETHERPAD_API_KEY || !process.env.ETHERPAD_PUBLIC_URL) {
        throw new BadRequestError("Etherpad ist nicht konfiguriert.");
    }
};

const call = async <T>(method: string, params: Record<string, string> = {}): Promise<EtherpadResponse<T>> => {
    requireConfig();
    try {
        const response = await axios.get<EtherpadResponse<T>>(`${internalUrl()}/api/1/${method}`, {
            params: {
                apikey: process.env.ETHERPAD_API_KEY,
                ...params,
            },
            timeout: 15000,
        });
        return response.data;
    } catch {
        throw new BadRequestError("Etherpad ist gerade nicht erreichbar.");
    }
};

const succeeded = <T>(response: EtherpadResponse<T>): response is EtherpadResponse<T> & { data: T } => {
    return response.code === 0 && response.data != null;
};

export const createGroup = async (): Promise<string> => {
    const response = await call<{ groupID: string }>("createGroup");
    if (!succeeded(response)) {
        throw new BadRequestError("Die Etherpad-Gruppe konnte nicht erstellt werden.");
    }
    return response.data.groupID;
};

export const createGroupPad = async (groupID: string, padName: string): Promise<string> => {
    const response = await call<{ padID: string }>("createGroupPad", { groupID, padName });
    if (succeeded(response)) {
        return response.data.padID;
    }
    if (/exist/i.test(response.message || "")) {
        return `${groupID}$${padName}`;
    }
    throw new BadRequestError("Das Etherpad konnte nicht erstellt werden.");
};

export const createAuthor = async (userId: string, name: string): Promise<string> => {
    const response = await call<{ authorID: string }>("createAuthorIfNotExistsFor", {
        authorMapper: userId,
        name,
    });
    if (!succeeded(response)) {
        throw new BadRequestError("Der Etherpad-Autor konnte nicht erstellt werden.");
    }
    return response.data.authorID;
};

export const createSession = async (groupID: string, authorID: string): Promise<string> => {
    const validUntil = String(Math.floor(Date.now() / 1000) + 60 * 60 * 24);
    const response = await call<{ sessionID: string }>("createSession", { groupID, authorID, validUntil });
    if (!succeeded(response)) {
        throw new BadRequestError("Die Etherpad-Sitzung konnte nicht erstellt werden.");
    }
    return response.data.sessionID;
};

export const getReadOnlyID = async (padID: string): Promise<string> => {
    const response = await call<{ readOnlyID: string }>("getReadOnlyID", { padID });
    if (!succeeded(response)) {
        throw new BadRequestError("Das Etherpad konnte nicht geöffnet werden.");
    }
    return response.data.readOnlyID;
};

export const getHTML = async (padID: string): Promise<string> => {
    const response = await call<{ html: string }>("getHTML", { padID });
    if (response.code !== 0) {
        throw new BadRequestError("Der Etherpad-Inhalt konnte nicht gelesen werden.");
    }
    return response.data?.html ?? "";
};

export const deletePad = async (padID: string): Promise<void> => {
    try {
        await call("deletePad", { padID });
    } catch (error) {
        console.error("[Etherpad]: Pad konnte nicht gelöscht werden.", error);
    }
};

export const deleteGroup = async (groupID: string): Promise<void> => {
    try {
        await call("deleteGroup", { groupID });
    } catch (error) {
        console.error("[Etherpad]: Gruppe konnte nicht gelöscht werden.", error);
    }
};

export const sessionCookieName = "ep_sessionID";

const readCookie = (header: string | undefined, name: string): string | null => {
    if (!header) {
        return null;
    }
    const match = header.split(/;\s*/).find((part) => part.split("=")[0] === name);
    if (!match) {
        return null;
    }
    try {
        return decodeURIComponent(match.split("=").slice(1).join("="));
    } catch {
        return null;
    }
};

export const sessionCookieValue = (cookieHeader: string | undefined, sessionID: string): string => {
    const existing = readCookie(cookieHeader, sessionCookieName) || "";
    const ids = existing.split(",").map((id) => id.trim()).filter(Boolean);
    if (!ids.includes(sessionID)) {
        ids.push(sessionID);
    }
    return ids.join(",");
};

export const padUrl = (padID: string, userName: string): string => {
    requireConfig();
    const base = process.env.ETHERPAD_PUBLIC_URL!.replace(/\/$/, "");
    const params = new URLSearchParams({
        showChat: "false",
        userName,
    });
    const pathId = encodeURIComponent(padID).replace(/%24/g, "$");
    return `${base}/p/${pathId}?${params.toString()}`;
};
