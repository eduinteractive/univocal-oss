import { Typography } from '@mantine/core';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface SiteHtmlProps {
    html?: string;
}

const SiteHtml = ({ html }: SiteHtmlProps) => {
    const sanitized = useMemo(() => DOMPurify.sanitize(html || ''), [html]);
    return (
        <Typography p={0}>
            <div dangerouslySetInnerHTML={{ __html: sanitized }} />
        </Typography>
    );
};

export default SiteHtml;
