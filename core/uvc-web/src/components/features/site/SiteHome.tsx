import { Container, Stack, Text } from '@mantine/core';
import { PROFILE_SECTION_TYPE, PublicSite } from '@eduinteractive/uvc-api';
import { ReactNode, useCallback } from 'react';
import { sectionAnchor } from './siteSections';
import { useTranslation } from 'react-i18next';
import SiteGallery from './SiteGallery';
import SiteHero from './SiteHero';
import SiteSection from './SiteSection';
import { useSiteTheme } from './SiteThemeContext';
import { SiteBoardFeed } from './cards/SiteBoardCard';
import { SiteEventCompact, SiteEventFeatured } from './cards/SiteEventCard';
import { SiteSupportCompact, SiteSupportFeatured } from './cards/SiteSupportCard';
import { SiteSurveyCompact, SiteSurveyFeatured } from './cards/SiteSurveyCard';

interface SiteHomeProps {
    data: PublicSite;
    /** Show empty sections with a hint (builder preview). */
    showEmpty?: boolean;
    logoAction?: ReactNode;
    descriptionAction?: ReactNode;
    galleryAction?: ReactNode;
}

const SiteHome = ({ data, showEmpty, logoAction, descriptionAction, galleryAction }: SiteHomeProps) => {
    const { t } = useTranslation();
    const { layout, layoutTokens } = useSiteTheme();
    const { featured } = data;
    const byId = useCallback((item: { _id: string }) => item._id, []);
    const bySurveyId = useCallback((item: { survey: { _id: string } }) => item.survey._id, []);

    const sectionLength: Record<PROFILE_SECTION_TYPE, number> = {
        [PROFILE_SECTION_TYPE.BOARD]: featured.board?.length ?? 0,
        [PROFILE_SECTION_TYPE.EVENTS]: featured.events.length,
        [PROFILE_SECTION_TYPE.SURVEYS]: featured.surveys.length,
        [PROFILE_SECTION_TYPE.SUPPORT]: featured.supportRequests.length,
    };

    const sections = data.site.sections.filter(
        (section) => section.enabled && (showEmpty || sectionLength[section.type] > 0)
    );
    const emptyText = showEmpty ? t('SITE.PUBLIC.SECTION_EMPTY') : undefined;
    const showGallery = data.site.galleryImages.length > 0 || !!galleryAction;
    const contentTop =
        layout === 'compact' ? 'md' : layoutTokens.heroStyle === 'overlay' ? 0 : 'lg';
    const elevated = layoutTokens.sectionChrome === 'elevated';

    const renderSection = (type: PROFILE_SECTION_TYPE) => {
        const title = t(`SITE.SECTIONS.${type}`);
        const id = sectionAnchor(type);
        switch (type) {
            case PROFILE_SECTION_TYPE.BOARD:
                return <SiteBoardFeed key={type} id={id} title={title} items={featured.board ?? []} emptyText={emptyText} />;
            case PROFILE_SECTION_TYPE.EVENTS:
                return (
                    <SiteSection
                        key={type}
                        id={id}
                        title={title}
                        items={featured.events}
                        getId={byId}
                        emptyText={emptyText}
                        renderFeatured={(event) => <SiteEventFeatured event={event} />}
                        renderCompact={(event, active) => <SiteEventCompact event={event} active={active} />}
                        elevated={elevated}
                    />
                );
            case PROFILE_SECTION_TYPE.SURVEYS:
                return (
                    <SiteSection
                        key={type}
                        id={id}
                        title={title}
                        items={featured.surveys}
                        getId={bySurveyId}
                        emptyText={emptyText}
                        renderFeatured={(entry) => <SiteSurveyFeatured entry={entry} />}
                        renderCompact={(entry, active) => <SiteSurveyCompact entry={entry} active={active} />}
                        elevated={elevated}
                    />
                );
            case PROFILE_SECTION_TYPE.SUPPORT:
                return (
                    <SiteSection
                        key={type}
                        id={id}
                        title={title}
                        items={featured.supportRequests}
                        getId={byId}
                        emptyText={emptyText}
                        renderFeatured={(request) => <SiteSupportFeatured request={request} />}
                        renderCompact={(request, active) => <SiteSupportCompact request={request} active={active} />}
                        elevated={elevated}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Stack gap={0}>
            <SiteHero data={data} logoAction={logoAction} descriptionAction={descriptionAction} />
            <Container
                size="lg"
                w="100%"
                mt={contentTop}
                pb="xl"
                pt={layoutTokens.heroStyle === 'overlay' ? 'xl' : undefined}
            >
                <Stack gap={layoutTokens.sectionGap}>
                    {showGallery && (
                        <Stack gap="xs">
                            {galleryAction}
                            <SiteGallery images={data.site.galleryImages} />
                        </Stack>
                    )}
                    {sections.map((section) => renderSection(section.type))}
                    {sections.length === 0 && !showGallery && showEmpty && (
                        <Text c="dimmed" size="sm">
                            {t('SITE.PUBLIC.SECTION_EMPTY')}
                        </Text>
                    )}
                </Stack>
            </Container>
        </Stack>
    );
};

export default SiteHome;
