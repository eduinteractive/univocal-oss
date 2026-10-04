import { TypographyStylesProvider } from '@mantine/core';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface SiteHtmlProps {
    html?: string;
}

const SiteHtml = ({ html }: SiteHtmlProps) => {
    const sanitized = useMemo(() => DOMPurify.sanitize(html || ''), [html]);
    return (
        <TypographyStylesProvider p={0}>
            <div dangerouslySetInnerHTML={{ __html: sanitized }} />
        </TypographyStylesProvider>
    );
};

export default SiteHtml;
