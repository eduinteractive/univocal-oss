"use client";

import { SAPI, type LandingCta, type LandingEventBody, type LandingPath } from "@eduinteractive/uvc-api";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect } from "react";

const MARKETING_PATHS = new Set<string>([
	"/",
	"/funktionen",
	"/faq",
	"/forschung",
	"/forschung/beitraege",
	"/forschung/opendata",
]);
const MORIGIN_RE = /^[A-Za-z0-9]{1,32}$/;
const UTM_RE = /^[A-Za-z0-9_.\-]{1,40}$/;
const HOST_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const NAV_TARGET_RE = /^\/[a-z0-9/-]{0,60}(#[a-z0-9-]{1,40})?$/;
const SECTION_RE = /^[a-z0-9_-]{1,48}$/;
const INTERACTION_RE = /^[a-z0-9_]{1,40}$/;
const SEARCH_HOSTS = [
	"bing.com",
	"duckduckgo.com",
	"ecosia.org",
	"startpage.com",
	"qwant.com",
	"search.brave.com",
	"yandex.ru",
	"baidu.com",
];
const SOCIAL_HOSTS = [
	"linkedin.com",
	"lnkd.in",
	"facebook.com",
	"instagram.com",
	"t.co",
	"x.com",
	"twitter.com",
	"youtube.com",
	"reddit.com",
	"xing.com",
	"tiktok.com",
	"pinterest.com",
	"threads.net",
	"bsky.app",
	"whatsapp.com",
];

type Referrer = NonNullable<LandingEventBody["referrer"]>;

const matchesHost = (host: string, names: string[]) =>
	names.some((name) => host === name || host.endsWith(`.${name}`));

const siteOf = (host: string) => host.split(".").slice(-2).join(".");

const readReferrer = (): { referrer: Referrer; referrerHost?: string } => {
	if (typeof document === "undefined" || !document.referrer) return { referrer: "direct" };
	try {
		const host = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, "");
		const ownHost = window.location.hostname.toLowerCase().replace(/^www\./, "");
		if (siteOf(host) === siteOf(ownHost)) return { referrer: "direct" };
		const referrerHost = HOST_RE.test(host) && host.length <= 64 ? host : undefined;
		if (/(^|\.)google\.[a-z.]+$/.test(host) && !host.startsWith("mail.")) {
			return { referrer: "search", referrerHost };
		}
		if (/(^|\.)yahoo\.[a-z.]+$/.test(host) || matchesHost(host, SEARCH_HOSTS)) {
			return { referrer: "search", referrerHost };
		}
		if (matchesHost(host, SOCIAL_HOSTS)) return { referrer: "social", referrerHost };
		return { referrer: "other", referrerHost };
	} catch {
		return { referrer: "direct" };
	}
};

const readQuery = (name: string, pattern: RegExp) => {
	if (typeof window === "undefined") return undefined;
	const value = new URLSearchParams(window.location.search).get(name) ?? "";
	return pattern.test(value) ? value : undefined;
};

const currentPath = (): LandingPath | null => {
	if (typeof window === "undefined") return null;
	const pathname = window.location.pathname.replace(/\/$/, "") || "/";
	return MARKETING_PATHS.has(pathname) ? (pathname as LandingPath) : null;
};

let lastEventKey = "";
let lastEventAt = 0;

const sendEvent = (body: LandingEventBody) => {
	const payload: LandingEventBody = { ...body };
	for (const key of Object.keys(payload) as (keyof LandingEventBody)[]) {
		if (payload[key] === undefined || payload[key] === "") delete payload[key];
	}

	const eventKey = JSON.stringify(payload);
	const now = Date.now();
	if (eventKey === lastEventKey && now - lastEventAt < 1000) return;
	lastEventKey = eventKey;
	lastEventAt = now;

	try {
		void SAPI.STATISTICS.PUBLIC.registerLandingEvent({ body: payload }).catch(() => undefined);
	} catch {
		// A failed statistics call must not affect navigation.
	}
};

const sendPageEvent = (body: Omit<LandingEventBody, "path">) => {
	const path = currentPath();
	if (!path) return;
	sendEvent({ ...body, path });
};

export const trackLandingCta = (cta: LandingCta) => {
	sendPageEvent({ type: "cta_click", cta });
};

export const trackLandingInteraction = (key: string) => {
	if (INTERACTION_RE.test(key)) sendPageEvent({ type: "interaction", key });
};

export const trackLandingFaq = (question: string) => {
	const key = question.replace(/[\u0000-\u001f<>@{}[\]\\]/g, "").trim().slice(0, 120);
	if (key) sendPageEvent({ type: "faq_open", key });
};

const sendPageView = (path: LandingPath) => {
	const referrer = readReferrer();
	sendEvent({
		type: "page_view",
		path,
		referrer: referrer.referrer,
		referrerHost: referrer.referrerHost,
		morigin: readQuery("morig", MORIGIN_RE),
		utmSource: readQuery("utm_source", UTM_RE),
		utmMedium: readQuery("utm_medium", UTM_RE),
		utmCampaign: readQuery("utm_campaign", UTM_RE),
	});
};

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

const trackScroll = (path: LandingPath) => {
	const reached = new Set<number>();
	const check = () => {
		const doc = document.documentElement;
		const scrollable = doc.scrollHeight - window.innerHeight;
		const ratio = scrollable <= 0 ? 1 : window.scrollY / scrollable;
		for (const milestone of SCROLL_MILESTONES) {
			const threshold = milestone === 100 ? 0.98 : milestone / 100;
			if (ratio >= threshold && !reached.has(milestone)) {
				reached.add(milestone);
				sendEvent({ type: "scroll", path, bucket: String(milestone) });
			}
		}
	};
	let frame = 0;
	const onScroll = () => {
		if (frame) return;
		frame = window.requestAnimationFrame(() => {
			frame = 0;
			check();
		});
	};
	const initial = window.setTimeout(check, 1500);
	window.addEventListener("scroll", onScroll, { passive: true });
	return () => {
		window.clearTimeout(initial);
		if (frame) window.cancelAnimationFrame(frame);
		window.removeEventListener("scroll", onScroll);
	};
};

/** Counts only the time the tab is visible and sends it once when the page is left. */
const trackVisibleTime = (path: LandingPath) => {
	let visibleMs = 0;
	let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
	let sent = false;

	const flush = () => {
		if (sent) return;
		if (visibleSince) visibleMs += Date.now() - visibleSince;
		visibleSince = 0;
		if (visibleMs < 1000) return;
		sent = true;
		sendEvent({ type: "engagement", path, value: Math.round(visibleMs / 1000) });
	};
	const onVisibility = () => {
		if (document.visibilityState === "visible") {
			if (!visibleSince) visibleSince = Date.now();
		} else {
			flush();
		}
	};
	document.addEventListener("visibilitychange", onVisibility);
	window.addEventListener("pagehide", flush);
	return () => {
		flush();
		document.removeEventListener("visibilitychange", onVisibility);
		window.removeEventListener("pagehide", flush);
	};
};

/** Reports each element marked with data-landing-section once it is at least a third visible. */
const trackSections = (path: LandingPath) => {
	if (typeof IntersectionObserver === "undefined") return () => undefined;
	const seen = new Set<string>();
	const keys = new Map<Element, string>();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const key = keys.get(entry.target) ?? "";
				if (!SECTION_RE.test(key) || seen.has(key)) continue;
				seen.add(key);
				observer.unobserve(entry.target);
				sendEvent({ type: "section_view", path, key });
			}
		},
		{ threshold: 0.33 }
	);
	const timer = window.setTimeout(() => {
		document.querySelectorAll<HTMLElement>("[data-landing-section]").forEach((element) => {
			keys.set(element, element.dataset.landingSection ?? "");
			observer.observe(element);
		});
	}, 300);
	return () => {
		window.clearTimeout(timer);
		observer.disconnect();
	};
};

export const LandingPageView = ({ path }: { path: LandingPath }) => {
	useEffect(() => {
		sendPageView(path);
		const stops = [trackScroll(path), trackVisibleTime(path), trackSections(path)];
		return () => stops.forEach((stop) => stop());
	}, [path]);
	return null;
};

const VITAL_NAMES = new Set(["LCP", "CLS", "INP", "FCP", "TTFB"]);
const MAX_ERRORS_PER_LOAD = 3;

const onDocumentClick = (event: MouseEvent) => {
	const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
	if (!anchor || anchor.dataset.landingIgnore !== undefined) return;
	let url: URL;
	try {
		url = new URL(anchor.href, window.location.href);
	} catch {
		return;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") return;

	const ownHost = window.location.hostname.toLowerCase().replace(/^www\./, "");
	const host = url.hostname.toLowerCase().replace(/^www\./, "");
	if (host === ownHost) {
		const target = `${url.pathname.toLowerCase().replace(/\/$/, "") || "/"}${url.hash.toLowerCase()}`;
		if (NAV_TARGET_RE.test(target)) sendPageEvent({ type: "nav_click", key: target });
		return;
	}
	if (siteOf(host) === siteOf(ownHost)) return;
	if (HOST_RE.test(host) && host.length <= 64) sendPageEvent({ type: "outbound_click", key: host });
};

/**
 * Site-wide listeners: link clicks, Web Vitals and script errors.
 * Mounted once in the app shell.
 */
export const LandingTracker = () => {
	useReportWebVitals((metric) => {
		if (!VITAL_NAMES.has(metric.name)) return;
		const rating = (metric as { rating?: string }).rating;
		if (rating !== "good" && rating !== "needs-improvement" && rating !== "poor") return;
		const value = metric.name === "CLS" ? metric.value * 1000 : metric.value;
		sendPageEvent({
			type: "vital",
			key: metric.name,
			bucket: rating,
			value: Math.min(Math.max(Math.round(value), 0), 600000),
		});
	});

	useEffect(() => {
		let errors = 0;
		const onError = () => {
			if (errors >= MAX_ERRORS_PER_LOAD) return;
			errors += 1;
			sendPageEvent({ type: "client_error" });
		};
		document.addEventListener("click", onDocumentClick, { capture: true });
		window.addEventListener("error", onError);
		window.addEventListener("unhandledrejection", onError);
		return () => {
			document.removeEventListener("click", onDocumentClick, { capture: true });
			window.removeEventListener("error", onError);
			window.removeEventListener("unhandledrejection", onError);
		};
	}, []);

	return null;
};
