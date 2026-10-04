export interface LandingAgent {
	bot: string;
	device: "desktop" | "mobile" | "tablet";
	browser: string;
	os: string;
}

const BOTS: [RegExp, string][] = [
	[/googlebot|google-inspectiontool|adsbot-google|mediapartners-google/i, "Google"],
	[/bingbot|bingpreview|msnbot/i, "Bing"],
	[/duckduckbot/i, "DuckDuckGo"],
	[/yandex/i, "Yandex"],
	[/baiduspider/i, "Baidu"],
	[/applebot/i, "Apple"],
	[/gptbot|chatgpt-user|oai-searchbot/i, "OpenAI"],
	[/claudebot|anthropic/i, "Anthropic"],
	[/perplexity/i, "Perplexity"],
	[/facebookexternalhit|meta-externalagent/i, "Meta"],
	[/linkedinbot/i, "LinkedIn"],
	[/twitterbot/i, "X"],
	[/slackbot|discordbot|telegrambot|whatsapp/i, "Messenger-Vorschau"],
	[/ahrefs|semrush|mj12bot|dotbot|petalbot|seznambot/i, "SEO-Crawler"],
	[/lighthouse|pagespeed|pingdom|uptimerobot|statuscake/i, "Monitoring"],
	[/headlesschrome|phantomjs|puppeteer|playwright|selenium/i, "Headless"],
	[/curl|wget|python-requests|axios|node-fetch|go-http-client|okhttp|java\//i, "Skript"],
	[/bot|crawl|spider|slurp/i, "Sonstiger Bot"],
];

const BROWSERS: [RegExp, string][] = [
	[/edg(e|a|ios)?\//i, "Edge"],
	[/opr\/|opera/i, "Opera"],
	[/samsungbrowser/i, "Samsung Internet"],
	[/firefox|fxios/i, "Firefox"],
	[/crios|chrome|chromium/i, "Chrome"],
	[/safari/i, "Safari"],
];

const OPERATING_SYSTEMS: [RegExp, string][] = [
	[/windows/i, "Windows"],
	[/iphone|ipad|ipod/i, "iOS"],
	[/android/i, "Android"],
	[/cros/i, "ChromeOS"],
	[/mac os x|macintosh/i, "macOS"],
	[/linux/i, "Linux"],
];

const firstMatch = (value: string, rules: [RegExp, string][], fallback: string) =>
	rules.find(([pattern]) => pattern.test(value))?.[1] ?? fallback;

/**
 * Reduces a User-Agent to coarse classes. The header itself is never stored.
 */
export const classifyUserAgent = (header: unknown): LandingAgent => {
	const value = typeof header === "string" ? header.slice(0, 512) : "";
	if (!value) {
		return { bot: "Ohne Kennung", device: "desktop", browser: "Sonstige", os: "Sonstige" };
	}

	const bot = firstMatch(value, BOTS, "");
	const tablet = /ipad|tablet|kindle|silk|playbook/i.test(value) ||
		(/android/i.test(value) && !/mobile/i.test(value));
	const mobile = !tablet && /mobi|iphone|ipod|android|windows phone/i.test(value);

	return {
		bot,
		device: tablet ? "tablet" : mobile ? "mobile" : "desktop",
		browser: firstMatch(value, BROWSERS, "Sonstige"),
		os: firstMatch(value, OPERATING_SYSTEMS, "Sonstige"),
	};
};
