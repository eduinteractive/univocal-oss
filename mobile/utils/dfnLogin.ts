import { BASE_URL } from "@/api/APIHandler";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export const DFN_CALLBACK_PATH = "auth/dfn";

export const DFN_ERROR_MESSAGES: Record<string, string> = {
	"4001": "Die Anwendung ist für deine Hochschule nicht freigegeben (DFN-AAI: kPID).",
	"4002": "Die Anwendung ist für deine Hochschule nicht freigegeben (DFN-AAI: kAttr).",
};

export class DfnLoginCancelledError extends Error {
	constructor() {
		super("University login was cancelled.");
		this.name = "DfnLoginCancelledError";
	}
}

export class DfnLoginError extends Error {
	status: string;

	constructor(status: string, message: string) {
		super(message);
		this.name = "DfnLoginError";
		this.status = status;
	}
}

export type DfnLoginResult =
	| { type: "success"; code: string }
	| { type: "error"; status: string; message: string };

export const startDfnLogin = async (): Promise<DfnLoginResult> => {
	const redirectUri = Linking.createURL(DFN_CALLBACK_PATH);
	const authUrl = `${BASE_URL}/api/auth/public/dfn/login?client=mobile`;

	const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

	if (result.type === "cancel" || result.type === "dismiss") {
		throw new DfnLoginCancelledError();
	}

	if (result.type !== "success") {
		throw new Error("University login failed.");
	}

	const parsed = Linking.parse(result.url);
	const queryParams = parsed.queryParams ?? {};

	const status = typeof queryParams.status === "string" ? queryParams.status : undefined;
	if (status) {
		const message = DFN_ERROR_MESSAGES[status] ?? "Die Hochschul-Anmeldung ist fehlgeschlagen.";
		return { type: "error", status, message };
	}

	const code = typeof queryParams.code === "string" ? queryParams.code : undefined;
	if (!code) {
		throw new Error("University login did not return an authorization code.");
	}

	return { type: "success", code };
};
