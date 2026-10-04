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

export type LandingPath = "/" | "/funktionen" | "/faq";

export type LandingCta = "header_login" | "homepage_github" | "homepage_saas_offer" | "saas_offer_submit";

export type LandingGranularity = "daily" | "weekly" | "monthly";

export interface LandingEventBody {
    type: LandingEventType;
    path: LandingPath;
    cta?: LandingCta;
    morigin?: string;
    referrer?: "direct" | "search" | "social" | "other";
    /** Hostname of an external referrer, without path or query. */
    referrerHost?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    key?: string;
    bucket?: string;
    value?: number;
}

export interface LandingCampaignStat {
    _id: string;
    metric: string;
    timestamp: Date;
    value: number;
}

export interface LandingTotals {
    pageViews: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    ctaClicks: number;
    convertedVisitors: number;
    conversionRate: number;
    clicksPer100Views: number;
    campaignViews: number;
    featureViews: number;
    bounceRate: number;
    pagesPerVisitor: number;
    avgTimeOnPage: number;
    scrolledToEnd: number;
    botHits: number;
    clientErrors: number;
}

export interface LandingCount {
    label: string;
    value: number;
}

export interface LandingConversionRow {
    label: string;
    visitors: number;
    conversions: number;
    rate: number;
}

export interface LandingPageRow {
    path: string;
    value: number;
    entries: number;
    exitRate: number;
    ctaClicks: number;
    clickRate: number;
    navClicks: number;
    avgTime: number;
    scroll25: number;
    scroll50: number;
    scroll75: number;
    scroll100: number;
}

export interface LandingVitalRow {
    name: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
    good: number;
    needsImprovement: number;
    poor: number;
    count: number;
    avg: number;
}

export interface LandingSeriesPoint {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    ctaClicks: number;
    conversions: number;
    campaignViews: number;
}

export interface LandingSummary {
    totals: LandingTotals;
    previousTotals: LandingTotals;
    series: LandingSeriesPoint[];
    pages: LandingPageRow[];
    campaigns: { morigin: string; value: number }[];
    referrers: { referrer: string; value: number }[];
    countries: { country: string; value: number }[];
    ctas: { cta: string; value: number }[];
    visitors: {
        devices: LandingCount[];
        browsers: LandingCount[];
        os: LandingCount[];
        regions: LandingCount[];
        languages: LandingCount[];
        recency: LandingCount[];
    };
    acquisition: {
        sources: LandingConversionRow[];
        referrerHosts: LandingCount[];
        utmSources: LandingCount[];
        utmMediums: LandingCount[];
        utmCampaigns: LandingCount[];
    };
    conversion: {
        funnel: LandingCount[];
        byEntry: LandingConversionRow[];
        byDevice: LandingConversionRow[];
        byCountry: LandingConversionRow[];
        byCta: LandingCount[];
        byDepth: LandingCount[];
    };
    engagement: {
        timeBuckets: LandingCount[];
        scrollDepth: (LandingCount & { share: number })[];
        depth: LandingCount[];
        sections: { path: string; key: string; value: number; share: number }[];
        transitions: { from: string; to: string; value: number }[];
        navTargets: LandingCount[];
        outbound: LandingCount[];
        faq: LandingCount[];
        interactions: LandingCount[];
    };
    timing: {
        heatmap: { weekday: number; hour: number; value: number }[];
    };
    technical: {
        vitals: LandingVitalRow[];
        vitalsByPage: { path: string; lcpGood: number; count: number }[];
        errors: { path: string; value: number }[];
        bots: LandingCount[];
    };
}
