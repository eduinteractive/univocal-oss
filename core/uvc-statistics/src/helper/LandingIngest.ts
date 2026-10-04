import { TimeSeriesStat } from "../models/TimeSeriesStat";
import { LandingDailyStat, LandingStatDims, LandingStatMetric } from "../models/LandingDailyStat";
import { ILandingVisitorDay, LandingVisitorDay } from "../models/LandingVisitorDay";
import { LandingVisitor } from "../models/LandingVisitor";
import { berlinWeekdayHour, emptyDims, ParsedLandingEvent, timeBucket, utcDay } from "./LandingEvent";
import { claimLandingSlot } from "./LandingDedupe";
import { LandingAgent } from "./LandingUserAgent";

/** Upper bound of accepted events per hashed address and day. */
export const LANDING_EVENT_CAP = 400;
const MAX_DEPTH = 10;

const MILESTONES: Record<string, string> = {
	"/funktionen": "funktionen",
	"/faq": "faq",
};

export const incrementDaily = async (
	metric: LandingStatMetric,
	dims: Partial<LandingStatDims>,
	amount = 1,
	timestamp = utcDay(new Date())
) => {
	const filter = { metric, timestamp, dims: { ...emptyDims(), ...dims } };
	try {
		await LandingDailyStat.updateOne(filter, { $inc: { value: amount } }, { upsert: true });
	} catch (error: any) {
		if (error?.code === 11000) {
			await LandingDailyStat.updateOne(filter, { $inc: { value: amount } });
			return;
		}
		throw error;
	}
};

export const incrementCampaign = async (morigin: string) => {
	await TimeSeriesStat.updateOne(
		{
			metric: "landing_page_campaign_" + morigin,
			timestamp: utcDay(new Date()),
		},
		{ $inc: { value: 1 } },
		{ upsert: true }
	);
};

export interface LandingRequestContext {
	ipHash: string;
	day: Date;
	now: Date;
	agent: LandingAgent;
	country: string;
	region: string;
	language: string;
}

const touchVisitorDay = async (context: LandingRequestContext) => {
	const update = {
		$inc: { events: 1 },
		$setOnInsert: {
			createdAt: context.now,
			device: context.agent.device,
			country: context.country,
		},
	};
	const filter = { day: context.day, ipHash: context.ipHash };
	try {
		return await LandingVisitorDay.findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after" });
	} catch (error: any) {
		if (error?.code !== 11000) throw error;
		return LandingVisitorDay.findOneAndUpdate(filter, { $inc: { events: 1 } }, { returnDocument: "after" });
	}
};

const sourceLabel = (event: ParsedLandingEvent) => {
	if (event.dims.morigin) return `morig:${event.dims.morigin}`;
	if (event.visit.utmSource) return `utm:${event.visit.utmSource}`;
	if (event.dims.referrer === "search" || event.dims.referrer === "social") {
		return event.visit.referrerHost
			? `${event.dims.referrer}:${event.visit.referrerHost}`
			: `ref:${event.dims.referrer}`;
	}
	if (event.dims.referrer === "other" && event.visit.referrerHost) {
		return `link:${event.visit.referrerHost}`;
	}
	return `ref:${event.dims.referrer || "direct"}`;
};

const recordFirstVisitOfDay = async (
	event: ParsedLandingEvent,
	context: LandingRequestContext
) => {
	const { agent, country, region } = context;
	const source = sourceLabel(event);
	await LandingVisitorDay.updateOne(
		{ day: context.day, ipHash: context.ipHash },
		{ $set: { entry: event.dims.path, source } }
	);

	const previous = await LandingVisitor.findOneAndUpdate(
		{ ipHash: context.ipHash },
		{ $set: { lastSeen: context.now }, $setOnInsert: { firstSeen: context.now } },
		{ upsert: true, returnDocument: "before" }
	).catch((error: any) => {
		if (error?.code === 11000) return { lastSeen: context.now } as { lastSeen: Date };
		throw error;
	});

	const attributes: [string, string][] = [
		["device", agent.device],
		["browser", agent.browser],
		["os", agent.os],
		["region", region],
		["source", source],
		["entry", event.dims.path],
		["referrer", event.dims.referrer || "direct"],
		["lang", context.language],
	];
	if (event.visit.referrerHost) attributes.push(["referrer_host", event.visit.referrerHost]);
	if (event.visit.utmSource) attributes.push(["utm_source", event.visit.utmSource]);
	if (event.visit.utmMedium) attributes.push(["utm_medium", event.visit.utmMedium]);
	if (event.visit.utmCampaign) attributes.push(["utm_campaign", event.visit.utmCampaign]);
	if (event.dims.morigin) attributes.push(["morigin", event.dims.morigin]);

	let recency = "";
	if (previous) {
		const days = Math.floor(
			(utcDay(context.now).getTime() - utcDay(new Date(previous.lastSeen)).getTime()) / 86400000
		);
		recency = days <= 1 ? "1" : days <= 7 ? "2-7" : "8-30";
	}

	await Promise.all([
		incrementDaily("unique_visitor", { country, device: agent.device }),
		incrementDaily("entry_page", { path: event.dims.path }),
		incrementDaily(previous ? "returning_visitor" : "new_visitor", { bucket: recency }),
		...attributes.map(([key, bucket]) => incrementDaily("visitor_attr", { key, bucket })),
	]);
};

const recordPageView = async (
	event: ParsedLandingEvent,
	context: LandingRequestContext
) => {
	const { path } = event.dims;
	const previous = await LandingVisitorDay.findOneAndUpdate(
		{ day: context.day, ipHash: context.ipHash, paths: { $ne: path } },
		{ $push: { paths: path }, $set: { lastPath: path } },
		{ returnDocument: "before" }
	);

	if (!previous) {
		await LandingVisitorDay.updateOne(
			{ day: context.day, ipHash: context.ipHash },
			{ $set: { lastPath: path } }
		);
		return false;
	}

	const depth = previous.paths.length + 1;
	const { weekday, hour } = berlinWeekdayHour(context.now);
	const writes: Promise<unknown>[] = [
		incrementDaily("page_view", {
			path,
			morigin: event.dims.morigin,
			referrer: event.dims.referrer,
			country: context.country,
			device: context.agent.device,
		}),
		incrementDaily("hourly", { key: weekday, bucket: hour }),
	];
	if (depth <= MAX_DEPTH) writes.push(incrementDaily("depth_reached", { bucket: String(depth) }));
	if (MILESTONES[path]) writes.push(incrementDaily("milestone", { key: MILESTONES[path] }));
	if (previous.paths.length === 0) {
		writes.push(recordFirstVisitOfDay(event, context));
	} else if (previous.lastPath && previous.lastPath !== path) {
		writes.push(incrementDaily("transition", { key: `${previous.lastPath}>${path}` }));
	}
	await Promise.all(writes);

	if (event.campaign) {
		const campaignCounted = await claimLandingSlot(
			context.ipHash,
			`campaign|${event.campaign}`,
			context.day
		);
		if (campaignCounted) await incrementCampaign(event.campaign);
	}
	return true;
};

const recordConversion = async (
	event: ParsedLandingEvent,
	visitor: ILandingVisitorDay,
	context: LandingRequestContext
) => {
	const result = await LandingVisitorDay.updateOne(
		{ day: context.day, ipHash: context.ipHash, converted: { $ne: true } },
		{ $set: { converted: true } }
	);
	if (result.modifiedCount !== 1) return;

	const segments: [string, string][] = [
		["source", visitor.source || "ref:direct"],
		["entry", visitor.entry || "unknown"],
		["device", visitor.device || context.agent.device],
		["country", visitor.country || context.country],
		["cta", event.dims.cta],
		["depth", String(Math.min(visitor.paths.length || 1, MAX_DEPTH))],
	];
	await Promise.all([
		incrementDaily("converted_visitor", {}),
		...segments.map(([key, bucket]) => incrementDaily("conversion", { key, bucket })),
	]);
};

const pageDims = (event: ParsedLandingEvent) => ({ path: event.dims.path });

const claim = (context: LandingRequestContext, parts: string[]) =>
	claimLandingSlot(context.ipHash, parts.join("|"), context.day);

/**
 * Records one landing event. Returns whether it changed any counter.
 */
export const recordLandingEvent = async (
	event: ParsedLandingEvent,
	context: LandingRequestContext
): Promise<boolean> => {
	const visitor = await touchVisitorDay(context);
	if (!visitor || visitor.events > LANDING_EVENT_CAP) return false;

	const { dims } = event;
	switch (event.type) {
		case "page_view":
			return recordPageView(event, context);
		case "cta_click": {
			if (!(await claim(context, ["cta_click", dims.path, dims.cta]))) return false;
			await Promise.all([
				incrementDaily("cta_click", {
					...pageDims(event),
					cta: dims.cta,
					country: context.country,
					device: context.agent.device,
				}),
				recordConversion(event, visitor, context),
			]);
			return true;
		}
		case "scroll":
			if (!(await claim(context, ["scroll", dims.path, dims.bucket]))) return false;
			await incrementDaily("scroll", { ...pageDims(event), bucket: dims.bucket });
			return true;
		case "engagement":
			if (!(await claim(context, ["engagement", dims.path]))) return false;
			await Promise.all([
				incrementDaily("time_sum", pageDims(event), event.value),
				incrementDaily("time_count", pageDims(event)),
				incrementDaily("time_bucket", { ...pageDims(event), bucket: timeBucket(event.value) }),
			]);
			return true;
		case "vital":
			if (!(await claim(context, ["vital", dims.path, dims.key]))) return false;
			await Promise.all([
				incrementDaily("vital", { ...pageDims(event), key: dims.key, bucket: dims.bucket }),
				incrementDaily("vital_sum", { ...pageDims(event), key: dims.key }, event.value),
				incrementDaily("vital_count", { ...pageDims(event), key: dims.key }),
			]);
			return true;
		case "client_error":
			await incrementDaily("client_error", pageDims(event));
			return true;
		case "section_view":
		case "nav_click":
		case "outbound_click":
		case "faq_open":
		case "interaction":
			if (!(await claim(context, [event.type, dims.path, dims.key]))) return false;
			await incrementDaily(event.type, { ...pageDims(event), key: dims.key });
			return true;
	}
	return false;
};

export const recordBotHit = (event: ParsedLandingEvent, agent: LandingAgent) =>
	incrementDaily("bot_hit", { path: event.dims.path, key: agent.bot });
