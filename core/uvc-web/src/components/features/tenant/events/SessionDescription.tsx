import { Text } from '@mantine/core';
import SiteHtml from '../../site/SiteHtml';
import { legalHtmlIsEmpty } from '../../site/legalHtml';

const looksLikeHtml = (value: string) => /<\/?[a-z][^>]*>/i.test(value);

const SessionDescription = ({ html, c = 'dimmed' }: { html?: string; c?: string }) => {
    if (!html || legalHtmlIsEmpty(html)) return null;
    if (looksLikeHtml(html)) return <SiteHtml html={html} />;
    return (
        <Text size="sm" c={c} style={{ whiteSpace: 'pre-line' }}>
            {html}
        </Text>
    );
};

export default SessionDescription;
