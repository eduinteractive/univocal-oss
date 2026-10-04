import { APIHandler } from "../base";
import { LandingEventBody } from "./Types";

/**
 * Landing Page Analytics
 *
 * Uses fetch with keepalive instead of axios so events sent while the page
 * unloads still reach the server. No cookies or referrer are transmitted.
 */

export const registerLandingEvent = async (req: { body: LandingEventBody }) => {
    const response = await fetch(`${APIHandler.defaults.baseURL}/statistics/public/platform/landing/event`, {
        method: "POST",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        keepalive: true,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
    });
    if (!response.ok) {
        throw new Error("Landing event rejected");
    }
    return response.json() as Promise<{ message: string; counted: boolean }>;
}
