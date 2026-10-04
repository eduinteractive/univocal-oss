export const PATH_LABELS: Record<string, string> = {
    '/': 'Startseite',
    '/funktionen': 'Funktionen',
    '/faq': 'FAQ',
    '/kontoloeschung': 'Kontolöschung',
    '/service/privacy': 'Datenschutz',
    '/service/imprint': 'Impressum',
    '/service/agb': 'AGB',
    '/service/nutzungsbedingungen': 'Nutzungsbedingungen',
    unknown: 'Unbekannt',
};

export const CTA_LABELS: Record<string, string> = {
    header_login: 'Login (Kopfzeile)',
    homepage_github: 'GitHub (Startseite)',
    homepage_saas_offer: 'SaaS-Angebot (Startseite)',
    saas_offer_submit: 'SaaS-Anfrage abgeschickt',
};

export const REFERRER_LABELS: Record<string, string> = {
    direct: 'Direkt',
    search: 'Suche',
    social: 'Social Media',
    other: 'Andere Website',
};

export const DEVICE_LABELS: Record<string, string> = {
    desktop: 'Desktop',
    mobile: 'Smartphone',
    tablet: 'Tablet',
};

export const INTERACTION_LABELS: Record<string, string> = {
    mobile_menu: 'Mobiles Menü geöffnet',
    use_case_open: 'Anwendungsbeispiel geöffnet',
};

export const SECTION_LABELS: Record<string, string> = {
    hero: 'Kopfbereich',
    plattform: 'Plattform',
    'open-source': 'Open Source',
    nutzung: 'Nutzung',
    werkzeuge: 'Werkzeuge',
    fachschaften: 'Fachschaften',
    asten: 'ASten',
    gremien: 'Gremien',
    'faq-1': 'univocal & SV-Hub',
    'faq-2': 'Funktionen',
    'faq-3': 'Nutzung & Bereitstellung',
    'faq-4': 'Technik & Datenschutz',
    'faq-5': 'Support',
};

export const RECENCY_LABELS: Record<string, string> = {
    '1': 'Seit gestern',
    '2-7': 'Innerhalb einer Woche',
    '8-30': 'Innerhalb von 30 Tagen',
};

export const TIME_BUCKET_LABELS: Record<string, string> = {
    '0-10': '< 10 s',
    '10-30': '10–30 s',
    '30-60': '30–60 s',
    '60-180': '1–3 min',
    '180-600': '3–10 min',
    '600+': '> 10 min',
};

export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const pathLabel = (path: string) => {
    const [base, hash] = path.split('#');
    const label = PATH_LABELS[base] ?? base;
    return hash ? `${label} › ${hash}` : label;
};

export const countryLabel = (code: string) => {
    if (!code || code === 'unknown') return 'Unbekannt';
    try {
        return (
            new Intl.DisplayNames(['de'], { type: 'region' }).of(code) ?? code
        );
    } catch {
        return code;
    }
};

export const regionLabel = (code: string) => {
    if (!code || code === 'unknown') return 'Unbekannt';
    const [country, region] = code.split('-');
    return `${countryLabel(country)} · ${region === '?' ? 'unbekannt' : region}`;
};

export const languageLabel = (code: string) => {
    if (!code || code === 'unknown') return 'Unbekannt';
    try {
        return (
            new Intl.DisplayNames(['de'], { type: 'language' }).of(code) ?? code
        );
    } catch {
        return code;
    }
};

export const sourceLabel = (source: string) => {
    const [kind, ...rest] = source.split(':');
    const value = rest.join(':');
    switch (kind) {
        case 'morig':
            return `Kampagne ${value}`;
        case 'utm':
            return `UTM ${value}`;
        case 'search':
            return `Suche · ${value}`;
        case 'social':
            return `Social · ${value}`;
        case 'link':
            return `Verweis · ${value}`;
        case 'ref':
            return REFERRER_LABELS[value] ?? value;
        default:
            return source;
    }
};

export const formatNumber = (value: number, digits = 0) =>
    value.toLocaleString('de-DE', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
    });

export const formatPercent = (value: number) => `${formatNumber(value, 1)} %`;

export const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')} min`;
};

export const formatMs = (value: number) =>
    value >= 1000
        ? `${formatNumber(value / 1000, 2)} s`
        : `${formatNumber(value)} ms`;
