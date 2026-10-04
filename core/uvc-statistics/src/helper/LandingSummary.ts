import { LandingStatDims, LandingStatMetric } from "../models/LandingDailyStat";
import { bucketKey, bucketsInRange, LandingGranularity, TIME_BUCKETS } from "./LandingEvent";

export interface LandingRow {
	metric: LandingStatMetric | string;
	timestamp: Date;
	value: number;
	dims: Partial<LandingStatDims>;
}

type Dim = keyof LandingStatDims;

const total = (rows: LandingRow[]) => rows.reduce((sum, row) => sum + row.value, 0);

const round = (value: number, digits = 1) => {
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
};

const percent = (part: number, whole: number) => (whole === 0 ? 0 : round((part / whole) * 100));

const groupSum = (rows: LandingRow[], key: (row: LandingRow) => string, skipEmpty = true) => {
	const totals = new Map<string, number>();
	for (const row of rows) {
		const label = key(row);
		if (skipEmpty && !label) continue;
		totals.set(label, (totals.get(label) ?? 0) + row.value);
	}
	return totals;
};

const sortedList = (totals: Map<string, number>, limit?: number) => {
	const list = Array.from(totals.entries())
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value);
	return limit ? list.slice(0, limit) : list;
};

const sumBy = <K extends Dim>(rows: LandingRow[], dim: K) =>
	Array.from(groupSum(rows, (row) => row.dims[dim] || "").entries())
		.map(([label, value]) => ({ [dim]: label, value }) as { [P in K]: string } & { value: number })
		.sort((a, b) => b.value - a.value);

const byMetric = (rows: LandingRow[]) => {
	const map = new Map<string, LandingRow[]>();
	for (const row of rows) {
		const list = map.get(row.metric) ?? [];
		list.push(row);
		map.set(row.metric, list);
	}
	return (metric: LandingStatMetric) => map.get(metric) ?? [];
};

const attrList = (rows: LandingRow[], key: string, limit?: number) =>
	sortedList(
		groupSum(
			rows.filter((row) => row.dims.key === key),
			(row) => row.dims.bucket || ""
		),
		limit
	);

const computeTotals = (rows: LandingRow[]) => {
	const metric = byMetric(rows);
	const pageViews = total(metric("page_view"));
	const uniqueVisitors = total(metric("unique_visitor"));
	const ctaClicks = total(metric("cta_click"));
	const convertedVisitors = total(metric("converted_visitor"));
	const depth = metric("depth_reached");
	const reached = (n: number) => total(depth.filter((row) => row.dims.bucket === String(n)));
	const depthOne = reached(1);
	const timeSum = total(metric("time_sum"));
	const timeCount = total(metric("time_count"));
	const scroll = metric("scroll");
	const scrollTotal = (bucket: string) => total(scroll.filter((row) => row.dims.bucket === bucket));

	return {
		pageViews,
		uniqueVisitors,
		newVisitors: total(metric("new_visitor")),
		returningVisitors: total(metric("returning_visitor")),
		ctaClicks,
		convertedVisitors,
		conversionRate: percent(convertedVisitors, uniqueVisitors),
		clicksPer100Views: percent(ctaClicks, pageViews),
		campaignViews: total(metric("page_view").filter((row) => row.dims.morigin)),
		featureViews: total(metric("page_view").filter((row) => row.dims.path === "/funktionen")),
		bounceRate: depthOne === 0 ? 0 : round(100 - percent(reached(2), depthOne)),
		pagesPerVisitor: depthOne === 0 ? 0 : round(total(depth) / depthOne, 2),
		avgTimeOnPage: timeCount === 0 ? 0 : Math.round(timeSum / timeCount),
		scrolledToEnd: percent(scrollTotal("100"), pageViews),
		botHits: total(metric("bot_hit")),
		clientErrors: total(metric("client_error")),
	};
};

export type LandingTotals = ReturnType<typeof computeTotals>;

const conversionTable = (
	visitors: { label: string; value: number }[],
	conversions: { label: string; value: number }[]
) => {
	const converted = new Map(conversions.map((row) => [row.label, row.value]));
	const labels = new Set([...visitors.map((row) => row.label), ...converted.keys()]);
	const visitorMap = new Map(visitors.map((row) => [row.label, row.value]));
	return Array.from(labels)
		.map((label) => {
			const count = visitorMap.get(label) ?? 0;
			const conv = converted.get(label) ?? 0;
			return { label, visitors: count, conversions: conv, rate: percent(conv, count) };
		})
		.sort((a, b) => b.visitors - a.visitors || b.conversions - a.conversions);
};

export const buildLandingSummary = (
	rows: LandingRow[],
	previousRows: LandingRow[],
	start: Date,
	end: Date,
	granularity: LandingGranularity
) => {
	const metric = byMetric(rows);
	const pageViews = metric("page_view");
	const clicks = metric("cta_click");
	const visitorAttrs = metric("visitor_attr");
	const conversions = metric("conversion");

	const buckets = bucketsInRange(start, end, granularity);
	const emptyPoint = (date: string) => ({
		date,
		pageViews: 0,
		uniqueVisitors: 0,
		newVisitors: 0,
		returningVisitors: 0,
		ctaClicks: 0,
		conversions: 0,
		campaignViews: 0,
	});
	type SeriesField = Exclude<keyof ReturnType<typeof emptyPoint>, "date">;
	const seriesMap = new Map(buckets.map((date) => [date, emptyPoint(date)]));
	const addToSeries = (list: LandingRow[], field: SeriesField) => {
		for (const row of list) {
			const point = seriesMap.get(bucketKey(row.timestamp, granularity));
			if (point) point[field] += row.value;
		}
	};
	addToSeries(pageViews, "pageViews");
	addToSeries(pageViews.filter((row) => row.dims.morigin), "campaignViews");
	addToSeries(metric("unique_visitor"), "uniqueVisitors");
	addToSeries(metric("new_visitor"), "newVisitors");
	addToSeries(metric("returning_visitor"), "returningVisitors");
	addToSeries(clicks, "ctaClicks");
	addToSeries(metric("converted_visitor"), "conversions");

	const pathTotals = (list: LandingRow[]) => groupSum(list, (row) => row.dims.path || "");
	const viewsByPath = pathTotals(pageViews);
	const entriesByPath = pathTotals(metric("entry_page"));
	const clicksByPath = pathTotals(clicks);
	const navByPath = pathTotals(metric("nav_click"));
	const timeSumByPath = pathTotals(metric("time_sum"));
	const timeCountByPath = pathTotals(metric("time_count"));
	const scrollRows = metric("scroll");
	const scrollByPath = (bucket: string) =>
		pathTotals(scrollRows.filter((row) => row.dims.bucket === bucket));
	const scrollMaps = {
		"25": scrollByPath("25"),
		"50": scrollByPath("50"),
		"75": scrollByPath("75"),
		"100": scrollByPath("100"),
	};
	const transitions = metric("transition");
	const outgoing = groupSum(transitions, (row) => (row.dims.key ?? "").split(">")[0] ?? "");

	const pages = Array.from(viewsByPath.entries())
		.map(([path, views]) => {
			const timeCount = timeCountByPath.get(path) ?? 0;
			const moved = outgoing.get(path) ?? 0;
			return {
				path,
				value: views,
				entries: entriesByPath.get(path) ?? 0,
				exitRate: percent(Math.max(views - moved, 0), views),
				ctaClicks: clicksByPath.get(path) ?? 0,
				clickRate: percent(clicksByPath.get(path) ?? 0, views),
				navClicks: navByPath.get(path) ?? 0,
				avgTime: timeCount === 0 ? 0 : Math.round((timeSumByPath.get(path) ?? 0) / timeCount),
				scroll25: percent(scrollMaps["25"].get(path) ?? 0, views),
				scroll50: percent(scrollMaps["50"].get(path) ?? 0, views),
				scroll75: percent(scrollMaps["75"].get(path) ?? 0, views),
				scroll100: percent(scrollMaps["100"].get(path) ?? 0, views),
			};
		})
		.sort((a, b) => b.value - a.value);

	const depthRows = metric("depth_reached");
	const reached = (n: number) => total(depthRows.filter((row) => row.dims.bucket === String(n)));
	const depth = Array.from({ length: 10 }, (_, index) => {
		const pagesCount = index + 1;
		const value = pagesCount === 10 ? reached(10) : reached(pagesCount) - reached(pagesCount + 1);
		return { label: pagesCount === 10 ? "10+" : String(pagesCount), value: Math.max(value, 0) };
	});

	const milestone = (key: string) => total(metric("milestone").filter((row) => row.dims.key === key));
	const funnel = [
		{ label: "Besucher", value: total(metric("unique_visitor")) },
		{ label: "Mehr als eine Seite", value: reached(2) },
		{ label: "Funktionen gesehen", value: milestone("funktionen") },
		{ label: "FAQ gesehen", value: milestone("faq") },
		{ label: "CTA geklickt", value: total(metric("converted_visitor")) },
	];

	const heatmap = Array.from(
		groupSum(metric("hourly"), (row) => `${row.dims.key}|${row.dims.bucket}`).entries()
	).map(([cell, value]) => {
		const [weekday, hour] = cell.split("|");
		return { weekday: Number(weekday), hour: Number(hour), value };
	});

	const vitalRows = metric("vital");
	const vitalSums = groupSum(metric("vital_sum"), (row) => row.dims.key || "");
	const vitalCounts = groupSum(metric("vital_count"), (row) => row.dims.key || "");
	const vitals = ["LCP", "INP", "CLS", "FCP", "TTFB"].map((name) => {
		const rating = (bucket: string) =>
			total(vitalRows.filter((row) => row.dims.key === name && row.dims.bucket === bucket));
		const count = vitalCounts.get(name) ?? 0;
		const avg = count === 0 ? 0 : (vitalSums.get(name) ?? 0) / count;
		return {
			name,
			good: rating("good"),
			needsImprovement: rating("needs-improvement"),
			poor: rating("poor"),
			count,
			avg: name === "CLS" ? round(avg / 1000, 3) : Math.round(avg),
		};
	});

	const vitalsByPage = Array.from(
		groupSum(
			vitalRows.filter((row) => row.dims.key === "LCP"),
			(row) => row.dims.path || ""
		).keys()
	).map((path) => {
		const list = vitalRows.filter((row) => row.dims.key === "LCP" && row.dims.path === path);
		const all = total(list);
		return { path, lcpGood: percent(total(list.filter((row) => row.dims.bucket === "good")), all), count: all };
	});

	const timeBuckets = TIME_BUCKETS.map((bucket) => ({
		label: bucket,
		value: total(metric("time_bucket").filter((row) => row.dims.bucket === bucket)),
	}));

	const viewTotal = total(pageViews);
	const scrollDepth = ["25", "50", "75", "100"].map((bucket) => {
		const value = total(scrollRows.filter((row) => row.dims.bucket === bucket));
		return { label: bucket, value, share: percent(value, viewTotal) };
	});

	const sections = Array.from(
		groupSum(metric("section_view"), (row) => `${row.dims.path}|${row.dims.key}`).entries()
	)
		.map(([cell, value]) => {
			const [path, key] = cell.split("|");
			return { path, key, value, share: percent(value, viewsByPath.get(path) ?? 0) };
		})
		.sort((a, b) => a.path.localeCompare(b.path) || b.value - a.value);

	const recency = sortedList(groupSum(metric("returning_visitor"), (row) => row.dims.bucket || ""));

	return {
		totals: computeTotals(rows),
		previousTotals: computeTotals(previousRows),
		series: buckets.map((date) => seriesMap.get(date) ?? emptyPoint(date)),
		pages,
		campaigns: sumBy(pageViews, "morigin"),
		referrers: sumBy(pageViews, "referrer"),
		countries: sumBy(metric("unique_visitor"), "country"),
		ctas: sumBy(clicks, "cta"),
		visitors: {
			devices: attrList(visitorAttrs, "device"),
			browsers: attrList(visitorAttrs, "browser"),
			os: attrList(visitorAttrs, "os"),
			regions: attrList(visitorAttrs, "region", 30),
			languages: attrList(visitorAttrs, "lang"),
			recency,
		},
		acquisition: {
			sources: conversionTable(attrList(visitorAttrs, "source", 50), attrList(conversions, "source")),
			referrerHosts: attrList(visitorAttrs, "referrer_host", 30),
			utmSources: attrList(visitorAttrs, "utm_source", 30),
			utmMediums: attrList(visitorAttrs, "utm_medium", 30),
			utmCampaigns: attrList(visitorAttrs, "utm_campaign", 30),
		},
		conversion: {
			funnel,
			byEntry: conversionTable(attrList(visitorAttrs, "entry"), attrList(conversions, "entry")),
			byDevice: conversionTable(attrList(visitorAttrs, "device"), attrList(conversions, "device")),
			byCountry: conversionTable(
				sortedList(groupSum(metric("unique_visitor"), (row) => row.dims.country || "")),
				attrList(conversions, "country")
			).slice(0, 20),
			byCta: attrList(conversions, "cta"),
			byDepth: attrList(conversions, "depth").sort((a, b) => Number(a.label) - Number(b.label)),
		},
		engagement: {
			timeBuckets,
			scrollDepth,
			depth,
			sections,
			transitions: sortedList(groupSum(transitions, (row) => row.dims.key || ""), 25).map((row) => {
				const [from, to] = row.label.split(">");
				return { from, to, value: row.value };
			}),
			navTargets: sortedList(groupSum(metric("nav_click"), (row) => row.dims.key || ""), 30),
			outbound: sortedList(groupSum(metric("outbound_click"), (row) => row.dims.key || ""), 30),
			faq: sortedList(groupSum(metric("faq_open"), (row) => row.dims.key || ""), 50),
			interactions: sortedList(groupSum(metric("interaction"), (row) => row.dims.key || "")),
		},
		timing: { heatmap },
		technical: {
			vitals,
			vitalsByPage,
			errors: sumBy(metric("client_error"), "path"),
			bots: sortedList(groupSum(metric("bot_hit"), (row) => row.dims.key || "")),
		},
	};
};

export type LandingSummaryPayload = ReturnType<typeof buildLandingSummary>;
