import { Box, Button, Card, Collapse, Group, Image, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { PublicSiteBoardItem } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../../../context/SiteContext';
import { profileImageUrl } from '../../../../utils/SiteHost';
import SiteHtml from '../SiteHtml';
import { SiteSectionEmpty, SiteSectionShell } from '../SiteSection';
import { htmlToText, truncate } from '../siteText';
import { useSiteTheme } from '../SiteThemeContext';
import classes from '../site.module.css';
import SiteDateBlock from './SiteDateBlock';

const boardDate = (item: PublicSiteBoardItem) => item.publishDate ?? item.updatedAt;

const BoardContent = ({ item }: { item: PublicSiteBoardItem }) => (
    <Stack gap="md" c="dark.6">
        {item.image && (
            <Image src={profileImageUrl(item.image)} alt="" mah={320} fit="cover" radius="md" />
        )}
        {/<[a-z][\s\S]*>/i.test(item.content) ? (
            <SiteHtml html={item.content} />
        ) : (
            <Text style={{ whiteSpace: 'pre-line' }}>{truncate(item.content, 1500)}</Text>
        )}
    </Stack>
);

const BoardRow = ({
    item,
    opened,
    onToggle,
}: {
    item: PublicSiteBoardItem;
    opened: boolean;
    onToggle: () => void;
}) => {
    const { t } = useTranslation();
    const { mobile } = useSite();
    const kindLabel = item.kind === 'NEWS' ? t('SITE.PUBLIC.BOARD_NEWS') : t('SITE.PUBLIC.BOARD_PROJECT');
    const contentId = `board-${item._id}`;

    return (
        <Box className={classes.feedItem}>
            <UnstyledButton
                className={classes.feedRow}
                onClick={onToggle}
                aria-expanded={opened}
                aria-controls={contentId}
            >
                <Group wrap="nowrap" align="flex-start" gap="md">
                    <SiteDateBlock date={boardDate(item)} filled={opened} />
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <Text size="xs" fw={700} tt="uppercase" lts={0.6} c="var(--site-primary)">
                            {kindLabel}
                        </Text>
                        <Text c="dark.8" className={classes.itemTitle}>
                            {item.title}
                        </Text>
                        {!opened && (
                            <Text size="sm" c="dimmed" lineClamp={2}>
                                {truncate(htmlToText(item.content), 220)}
                            </Text>
                        )}
                    </Stack>
                    {item.image && !opened && !mobile && (
                        <Image
                            src={profileImageUrl(item.image)}
                            alt=""
                            w={72}
                            h={72}
                            radius="md"
                            fit="cover"
                            visibleFrom="sm"
                            style={{ flexShrink: 0 }}
                        />
                    )}
                    <IconChevronDown
                        size={18}
                        aria-hidden
                        color="var(--site-primary)"
                        style={{
                            flexShrink: 0,
                            marginTop: 4,
                            transform: opened ? 'rotate(180deg)' : undefined,
                            transition: 'transform 200ms ease',
                        }}
                    />
                </Group>
            </UnstyledButton>
            <Collapse expanded={opened} transitionDuration={250}>
                <Box id={contentId} px="lg" pb="lg" pl={mobile ? 'lg' : { base: 'lg', sm: 88 }}>
                    <BoardContent item={item} />
                </Box>
            </Collapse>
        </Box>
    );
};

interface SiteBoardFeedProps {
    id: string;
    title: string;
    items: PublicSiteBoardItem[];
    emptyText?: string;
}

/** "Aktuelles": dated feed, newest first; the first entry starts expanded. */
export const SiteBoardFeed = ({ id, title, items, emptyText }: SiteBoardFeedProps) => {
    const { t } = useTranslation();
    const { layoutTokens } = useSiteTheme();
    const [openId, setOpenId] = useState<string | undefined>(items[0]?._id);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (openId && !items.some((item) => item._id === openId)) setOpenId(items[0]?._id);
    }, [items, openId]);

    if (items.length === 0 && !emptyText) return null;

    const visible = showAll ? items : items.slice(0, layoutTokens.feedLimit);
    const hidden = items.length - visible.length;

    return (
        <SiteSectionShell id={id} title={title}>
            {items.length === 0 ? (
                <SiteSectionEmpty text={emptyText} />
            ) : (
                <Stack gap="sm">
                    <Card radius="var(--site-radius)" p={0} withBorder style={{ overflow: 'hidden' }}>
                        {visible.map((item) => (
                            <BoardRow
                                key={item._id}
                                item={item}
                                opened={openId === item._id}
                                onToggle={() => setOpenId((current) => (current === item._id ? undefined : item._id))}
                            />
                        ))}
                    </Card>
                    {hidden > 0 && (
                        <Button
                            variant="subtle"
                            color="var(--site-primary)"
                            radius="xl"
                            size="sm"
                            onClick={() => setShowAll(true)}
                            style={{ alignSelf: 'flex-start' }}
                        >
                            {t('SITE.PUBLIC.BOARD_SHOW_MORE', { count: hidden })}
                        </Button>
                    )}
                </Stack>
            )}
        </SiteSectionShell>
    );
};
