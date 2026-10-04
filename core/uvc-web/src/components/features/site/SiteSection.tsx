import { Box, Card, Grid, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ReactNode, useEffect, useState } from 'react';
import { useSite } from '../../../context/SiteContext';
import classes from './site.module.css';
import { useSiteTheme } from './SiteThemeContext';

interface SiteSectionProps<T> {
    id: string;
    title: string;
    items: T[];
    getId: (item: T) => string;
    renderFeatured: (item: T) => ReactNode;
    renderCompact: (item: T, active: boolean) => ReactNode;
    emptyText?: string;
    action?: ReactNode;
    /** One shadow around the whole section instead of each card. */
    elevated?: boolean;
}

export const SiteSectionShell = ({
    id,
    title,
    action,
    elevated,
    children,
}: {
    id: string;
    title: string;
    action?: ReactNode;
    elevated?: boolean;
    children: ReactNode;
}) => {
    const { layoutTokens } = useSiteTheme();
    const chrome = layoutTokens.sectionChrome;
    const wrapElevated = elevated && chrome === 'elevated';

    return (
        <Box
            component="section"
            id={id}
            aria-labelledby={`${id}-title`}
            className={chrome === 'ruled' ? classes.sectionRuled : undefined}
            style={{ scrollMarginTop: 80 }}
        >
            <Box
                mb={chrome === 'ruled' ? 16 : 8}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}
            >
                <Title
                    order={2}
                    id={`${id}-title`}
                    fz={chrome === 'ruled' ? 26 : 22}
                    fw={700}
                    lh={1.25}
                    c="var(--site-primary)"
                    className={classes.sectionTitle}
                >
                    {title}
                </Title>
                {action}
            </Box>
            {wrapElevated ? <Box className={classes.sectionPanel}>{children}</Box> : children}
        </Box>
    );
};

export const SiteSectionEmpty = ({ text }: { text?: string }) => (
    <Card radius="var(--site-radius)" bg="var(--site-soft)" p="lg">
        <Text c="dimmed" size="sm">
            {text}
        </Text>
    </Card>
);

/**
 * Compact / Magazin: selected item large on the left, list on the right (mobile stacks).
 * Bühne: every item as a full featured card in a presentation stack.
 */
function SiteSection<T>({
    id,
    title,
    items,
    getId,
    renderFeatured,
    renderCompact,
    emptyText,
    action,
    elevated,
}: SiteSectionProps<T>) {
    const { mobile } = useSite();
    const { layoutTokens } = useSiteTheme();
    const isMobile = useMediaQuery('(max-width: 48em)') || !!mobile;
    const stackAll = layoutTokens.sectionChrome === 'cards';
    const [activeId, setActiveId] = useState<string | undefined>(items[0] ? getId(items[0]) : undefined);

    useEffect(() => {
        if (!items.some((item) => getId(item) === activeId)) {
            setActiveId(items[0] ? getId(items[0]) : undefined);
        }
    }, [items, activeId, getId]);

    if (items.length === 0 && !emptyText) return null;

    const active = items.find((item) => getId(item) === activeId);

    let body: ReactNode;
    if (items.length === 0) {
        body = <SiteSectionEmpty text={emptyText} />;
    } else if (stackAll) {
        body = (
            <Stack gap="md">
                {items.map((item) => (
                    <Box key={getId(item)}>{renderFeatured(item)}</Box>
                ))}
            </Stack>
        );
    } else if (isMobile || items.length === 1) {
        body = (
            <Stack gap="sm">
                {items.map((item) => {
                    const itemId = getId(item);
                    const isActive = items.length === 1 || itemId === activeId;
                    return isActive ? (
                        <Box key={itemId}>{renderFeatured(item)}</Box>
                    ) : (
                        <UnstyledButton
                            key={itemId}
                            onClick={() => setActiveId(itemId)}
                            className={classes.pressable}
                            aria-expanded={false}
                        >
                            {renderCompact(item, false)}
                        </UnstyledButton>
                    );
                })}
            </Stack>
        );
    } else {
        body = (
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 7 }}>{active && renderFeatured(active)}</Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack gap="sm" mah={560} style={{ overflowY: 'auto' }}>
                        {items.map((item) => {
                            const itemId = getId(item);
                            return (
                                <UnstyledButton
                                    key={itemId}
                                    onClick={() => setActiveId(itemId)}
                                    className={classes.pressable}
                                    aria-pressed={itemId === activeId}
                                >
                                    {renderCompact(item, itemId === activeId)}
                                </UnstyledButton>
                            );
                        })}
                    </Stack>
                </Grid.Col>
            </Grid>
        );
    }

    return (
        <SiteSectionShell id={id} title={title} action={action} elevated={elevated}>
            {body}
        </SiteSectionShell>
    );
}

export default SiteSection;
