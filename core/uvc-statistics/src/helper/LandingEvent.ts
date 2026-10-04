import { BadRequestError } from "@eduinteractive/uvc-common";
import { LandingStatDims } from "../models/LandingDailyStat";

export const MARKETING_PATHS = ["/", "/funktionen", "/faq"] as const;

export const LANDING_CTAS = [
	"header_login",
	"homepage_github",
	"homepage_saas_offer",
	"saas_offer_submit",
] as const;

const STATIC_PATHS = new Set<string>(MARKETING_PATHS);
const CTAS = new Set<string>(LANDING_CTAS);
const REFERRERS = new Set(["direct", "search", "social", "other"]);
const SCROLL_BUCKETS = new Set(["25", "50", "75", "100"]);
const VITALS = new Set(["LCP", "CLS", "INP", "FCP", "TTFB"]);
const VITAL_RATINGS = new Set(["good", "needs-improvement", "poor"]);
const MORIGIN_RE = /^[A-Za-z0-9]{1,32}$/;
const UTM_RE = /^[A-Za-z0-9_.\-]{1,40}$/;
const HOST_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const SECTION_RE = /^[a-z0-9_-]{1,48}$/;
const INTERACTION_RE = /^[a-z0-9_]{1,40}$/;
const NAV_TARGET_RE = /^\/[a-z0-9/-]{0,60}(#[a-z0-9-]{1,40})?$/;
const FAQ_RE = /^[^\u0000-\u001f<>@{}[\]\\]{1,120}$/;

const ALLOWED_BODY_KEYS = new Set([
	"type",
	"path",
	"cta",
	"morigin",
	"referrer",
	"referrerHost",
	"utmSource",
	"utmMedium",
	"utmCampaign",
	"key",
	"bucket",
	"value",
]);

export type LandingEventType =
	| "page_view"
	| "cta_click"
	| "scroll"
	| "engagement"
	| "section_view"
	| "nav_click"
	| "outbound_click"
	| "faq_open"
	| "interaction"
	| "vital"
	| "client_error";

const EVENT_TYPES = new Set<LandingEventType>([
	"page_view",
	"cta_click",
	"scroll",
	"engagement",
	"section_view",
	"nav_click",
	"outbound_click",
	"faq_open",
	"interaction",
	"vital",
	"client_error",
]);

export type LandingGranularity = "daily" | "weekly" | "monthly";

export interface LandingVisitContext {
	referrerHost: string;
	utmSource: string;
	utmMedium: string;
	utmCampaign: string;
}

export interface ParsedLandingEvent {
	type: LandingEventType;
	dims: LandingStatDims;
	value: number;
	visit: LandingVisitContext;
	campaign?: string;
}

export const emptyDims = (): LandingStatDims => ({
	path: "",
	cta: "",
	morigin: "",
	referrer: "",
	country: "",
	device: "",
	key: "",
	bucket: "",
});

const asOptionalString = (value: unknown, field: string, maxLength = 64): string => {
	if (value === undefined) return "";
	if (typeof value !== "string" || value.length > maxLength) {
		throw new BadRequestError(`Invalid ${field}`);
	}
	return value;
};

const matchOptional = (value: string, pattern: RegExp, field: string) => {
	if (value !== "" && !pattern.test(value)) throw new BadRequestError(`Invalid ${field}`);
	return value;
};

export const isValidMorigin = (morigin: string) => MORIGIN_RE.test(morigin);

const emptyVisit = (): LandingVisitContext => ({
	referrerHost: "",
	utmSource: "",
	utmMedium: "",
	utmCampaign: "",
});

export const parseLandingEvent = (body: unknown): ParsedLandingEvent => {
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		throw new BadRequestError("Invalid event");
	}

	const record = body as Record<string, unknown>;
	for (const key of Object.keys(record)) {
		if (!ALLOWED_BODY_KEYS.has(key)) {
			throw new BadRequestError("Invalid event");
		}
	}

	const type = record.type as LandingEventType;
	if (typeof type !== "string" || !EVENT_TYPES.has(type)) {
		throw new BadRequestError("Invalid event");
	}

	const path = record.path;
	if (typeof path !== "string" || !STATIC_PATHS.has(path)) {
		throw new BadRequestError("Invalid path");
	}

	const referrer = asOptionalString(record.referrer, "referrer");
	if (referrer !== "" && !REFERRERS.has(referrer)) {
		throw new BadRequestError("Invalid referrer");
	}
	const morigin = matchOptional(asOptionalString(record.morigin, "morigin"), MORIGIN_RE, "morigin");
	const ctaIn = asOptionalString(record.cta, "cta");
	const keyIn = asOptionalString(record.key, "key", 120);
	const bucketIn = asOptionalString(record.bucket, "bucket", 24);
	const valueIn = record.value;
	if (valueIn !== undefined && (typeof valueIn !== "number" || !Number.isFinite(valueIn))) {
		throw new BadRequestError("Invalid value");
	}

	const visit = emptyVisit();
	const dims = emptyDims();
	dims.referrer = referrer;
	dims.path = path;

	const forbidOthers = (allowed: string[]) => {
		const present: Record<string, string> = { cta: ctaIn, key: keyIn, bucket: bucketIn };
		for (const [field, value] of Object.entries(present)) {
			if (value && !allowed.includes(field)) throw new BadRequestError(`Invalid ${field}`);
		}
	};

	switch (type) {
		case "page_view": {
			forbidOthers([]);
			dims.morigin = morigin;
			const referrerHost = asOptionalString(record.referrerHost, "referrerHost").toLowerCase();
			if (referrerHost) {
				if (!HOST_RE.test(referrerHost) || referrer === "direct" || referrer === "") {
					throw new BadRequestError("Invalid referrerHost");
				}
			}
			visit.referrerHost = referrerHost;
			visit.utmSource = matchOptional(asOptionalString(record.utmSource, "utmSource"), UTM_RE, "utmSource").toLowerCase();
			visit.utmMedium = matchOptional(asOptionalString(record.utmMedium, "utmMedium"), UTM_RE, "utmMedium").toLowerCase();
			visit.utmCampaign = matchOptional(asOptionalString(record.utmCampaign, "utmCampaign"), UTM_RE, "utmCampaign").toLowerCase();
			return { type, dims, value: 1, visit, campaign: morigin || undefined };
		}
		case "cta_click":
			forbidOthers(["cta"]);
			if (!CTAS.has(ctaIn)) throw new BadRequestError("Invalid cta");
			dims.cta = ctaIn;
			return { type, dims, value: 1, visit };
		case "scroll":
			forbidOthers(["bucket"]);
			if (!SCROLL_BUCKETS.has(bucketIn)) throw new BadRequestError("Invalid bucket");
			dims.bucket = bucketIn;
			return { type, dims, value: 1, visit };
		case "engagement": {
			forbidOthers([]);
			if (typeof valueIn !== "number" || valueIn < 0) throw new BadRequestError("Invalid value");
			return { type, dims, value: Math.min(Math.round(valueIn), 1800), visit };
		}
		case "section_view":
			forbidOthers(["key"]);
			if (!SECTION_RE.test(keyIn)) throw new BadRequestError("Invalid key");
			dims.key = keyIn;
			return { type, dims, value: 1, visit };
		case "nav_click":
			forbidOthers(["key"]);
			if (!NAV_TARGET_RE.test(keyIn)) throw new BadRequestError("Invalid key");
			dims.key = keyIn;
			return { type, dims, value: 1, visit };
		case "outbound_click":
			forbidOthers(["key"]);
			if (!HOST_RE.test(keyIn) || keyIn.length > 64) throw new BadRequestError("Invalid key");
			dims.key = keyIn;
			return { type, dims, value: 1, visit };
		case "faq_open":
			forbidOthers(["key"]);
			if (dims.path !== "/faq" || !FAQ_RE.test(keyIn)) throw new BadRequestError("Invalid key");
			dims.key = keyIn.trim();
			return { type, dims, value: 1, visit };
		case "interaction":
			forbidOthers(["key"]);
			if (!INTERACTION_RE.test(keyIn)) throw new BadRequestError("Invalid key");
			dims.key = keyIn;
			return { type, dims, value: 1, visit };
		case "vital": {
			forbidOthers(["key", "bucket"]);
			if (!VITALS.has(keyIn) || !VITAL_RATINGS.has(bucketIn)) {
				throw new BadRequestError("Invalid vital");
			}
			if (typeof valueIn !== "number" || valueIn < 0 || valueIn > 600000) {
				throw new BadRequestError("Invalid value");
			}
			dims.key = keyIn;
			dims.bucket = bucketIn;
			return { type, dims, value: Math.round(valueIn), visit };
		}
		case "client_error":
			forbidOthers([]);
			return { type, dims, value: 1, visit };
	}

	throw new BadRequestError("Invalid event");
};

/** Primary subtag of the first Accept-Language entry, e.g. "de". */
export const languageFromHeader = (header: unknown) => {
	const first = typeof header === "string" ? header.split(",")[0] ?? "" : "";
	const primary = first.split(";")[0].trim().split("-")[0].toLowerCase();
	return /^[a-z]{2,3}$/.test(primary) ? primary : "unknown";
};

export const TIME_BUCKETS = ["0-10", "10-30", "30-60", "60-180", "180-600", "600+"] as const;

export const timeBucket = (seconds: number) => {
	if (seconds < 10) return "0-10";
	if (seconds < 30) return "10-30";
	if (seconds < 60) return "30-60";
	if (seconds < 180) return "60-180";
	if (seconds < 600) return "180-600";
	return "600+";
};

const BERLIN_FORMAT = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/Berlin",
	weekday: "short",
	hour: "2-digit",
	hourCycle: "h23",
});
const WEEKDAYS: Record<string, string> = { Mon: "1", Tue: "2", Wed: "3", Thu: "4", Fri: "5", Sat: "6", Sun: "7" };

/** Weekday (1 = Monday) and hour in German local time. */
export const berlinWeekdayHour = (date: Date) => {
	const parts = BERLIN_FORMAT.formatToParts(date);
	const weekday = WEEKDAYS[parts.find((part) => part.type === "weekday")?.value ?? ""] ?? "1";
	const hour = (parts.find((part) => part.type === "hour")?.value ?? "00").padStart(2, "0");
	return { weekday, hour };
};

export const utcDay = (date: Date) =>
	new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const startOfIsoWeek = (date: Date) => {
	const day = utcDay(date);
	const weekday = day.getUTCDay() || 7;
	day.setUTCDate(day.getUTCDate() - (weekday - 1));
	return day;
};

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const monthKey = (date: Date) =>
	`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

export const bucketKey = (date: Date, granularity: LandingGranularity) => {
	if (granularity === "monthly") return monthKey(date);
	if (granularity === "weekly") return dayKey(startOfIsoWeek(date));
	return dayKey(utcDay(date));
};

export const bucketsInRange = (
	start: Date,
	end: Date,
	granularity: LandingGranularity
): string[] => {
	if (granularity === "daily") {
		const keys: string[] = [];
		for (let cursor = utcDay(start); cursor <= end; cursor = new Date(cursor.getTime() + 86400000)) {
			keys.push(dayKey(cursor));
		}
		return keys;
	}

	if (granularity === "monthly") {
		const keys: string[] = [];
		let year = start.getUTCFullYear();
		let month = start.getUTCMonth();
		const last = monthKey(end);
		while (keys.length < 240) {
			const key = `${year}-${String(month + 1).padStart(2, "0")}`;
			keys.push(key);
			if (key === last) break;
			month += 1;
			if (month > 11) {
				month = 0;
				year += 1;
			}
		}
		return keys;
	}

	const keys: string[] = [];
	let cursor = startOfIsoWeek(start);
	const last = startOfIsoWeek(end);
	while (cursor <= last && keys.length < 240) {
		keys.push(dayKey(cursor));
		cursor = new Date(cursor.getTime() + 7 * 86400000);
	}
	return keys;
};
