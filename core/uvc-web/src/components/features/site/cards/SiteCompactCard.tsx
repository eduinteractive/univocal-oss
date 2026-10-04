import { Box, Card, Group, Text, ThemeIcon } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { useSiteTheme } from '../SiteThemeContext';
import classes from '../site.module.css';

interface SiteCompactCardProps {
    icon: ReactNode;
    title: string;
    meta?: string;
    active?: boolean;
}

const SiteCompactCard = ({ icon, title, meta, active }: SiteCompactCardProps) => {
    const compact = useSiteTheme().layout === 'compact';
    return (
        <Card
            radius="lg"
            p={compact ? 'sm' : 'md'}
            bg={active ? 'var(--site-primary)' : 'var(--site-soft)'}
            className={classes.compactCard}
            data-active={active ? 'true' : 'false'}
        >
            <Group wrap="nowrap" gap="sm">
                <ThemeIcon
                    size={compact ? 34 : 40}
                    radius="md"
                    variant={active ? 'white' : 'light'}
                    color="var(--site-primary)"
                >
                    {icon}
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={700} c={active ? 'white' : 'var(--site-primary)'} lineClamp={2} size={compact ? 'sm' : 'md'}>
                        {title}
                    </Text>
                    {meta && (
                        <Text size={compact ? 'xs' : 'sm'} c={active ? 'var(--site-on-primary-muted)' : 'dimmed'} lineClamp={1}>
                            {meta}
                        </Text>
                    )}
                </Box>
                <IconChevronRight size={18} color={active ? 'white' : 'var(--site-primary)'} aria-hidden />
            </Group>
        </Card>
    );
};

export default SiteCompactCard;
