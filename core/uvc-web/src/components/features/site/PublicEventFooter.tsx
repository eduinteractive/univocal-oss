import { Anchor, Box, Container, Divider, Group, Stack, Text } from '@mantine/core';
import { IconMail, IconPhone, IconUser, IconWorld } from '@tabler/icons-react';
import { ProfileSiteLegalNotice, SAPI } from '@eduinteractive/uvc-api';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { buildSiteUrl } from '../../../utils/SiteHost';
import { legalHtmlIsEmpty } from './legalHtml';
import { displayUrl, externalUrl } from './siteLinks';

interface PublicEventFooterProps {
    tenantId?: string;
    size?: 'sm' | 'lg';
    fluid?: boolean;
}

const legalHref = (notice: ProfileSiteLegalNotice | undefined, pageUrl: string) => {
    if (notice?.mode === 'link' && notice.url) return externalUrl(notice.url);
    if (notice?.mode !== 'link' && !legalHtmlIsEmpty(notice?.text)) return pageUrl;
    return undefined;
};

const PublicEventFooter = ({ tenantId, size = 'lg', fluid }: PublicEventFooterProps) => {
    const { t } = useTranslation();
    const profileQuery = useQuery({
        queryKey: ['public-profile', tenantId],
        queryFn: () => SAPI.PROFILE.PUBLIC.getPublicProfile(tenantId!),
        enabled: !!tenantId,
        retry: false,
    });
    const profile = profileQuery.data?.profile;
    const site = profile?.site?.published && profile.site.subdomain ? profile.site : undefined;
    const contactPerson = site ? profile?.contactPerson : undefined;
    const contactEmail = site ? profile?.contactEmail : undefined;
    const contactPhone = site ? profile?.contactPhone : undefined;
    const contactWebsite = site ? profile?.contactWebsite : undefined;
    const hasContact = !!(contactPerson || contactEmail || contactPhone || contactWebsite);
    const siteOrigin = site?.subdomain ? buildSiteUrl(site.subdomain) : undefined;
    const imprintHref = siteOrigin ? legalHref(site?.legal?.imprint, `${siteOrigin}/impressum`) : undefined;
    const privacyHref = siteOrigin ? legalHref(site?.legal?.privacy, `${siteOrigin}/datenschutz`) : undefined;

    return (
        <Box component="footer" bg="var(--site-footer)" c="white" mt="xl">
            <Container fluid={fluid} size={fluid ? undefined : size} px={fluid ? { base: 'md', sm: 'xl' } : undefined} py={40}>
                {profile?.title && <Text fw={800} size="lg">{profile.title}</Text>}
                {hasContact && (
                    <Stack gap={6} mt="sm">
                        {contactPerson && (
                            <FooterLine icon={<IconUser size={16} />}>{contactPerson}</FooterLine>
                        )}
                        {contactEmail && (
                            <FooterLine icon={<IconMail size={16} />}>
                                <Anchor href={`mailto:${contactEmail}`} c="white">
                                    {contactEmail}
                                </Anchor>
                            </FooterLine>
                        )}
                        {contactPhone && (
                            <FooterLine icon={<IconPhone size={16} />}>
                                <Anchor href={`tel:${contactPhone}`} c="white">
                                    {contactPhone}
                                </Anchor>
                            </FooterLine>
                        )}
                        {contactWebsite && (
                            <FooterLine icon={<IconWorld size={16} />}>
                                <Anchor href={externalUrl(contactWebsite)} target="_blank" rel="noopener noreferrer" c="white">
                                    {displayUrl(contactWebsite)}
                                </Anchor>
                            </FooterLine>
                        )}
                    </Stack>
                )}
                {(imprintHref || privacyHref) && (
                    <Group gap="lg" mt="xl">
                        {imprintHref && (
                            <Anchor href={imprintHref} target="_blank" rel="noopener noreferrer" c="white" size="sm">
                                {t('SITE.PUBLIC.IMPRINT')}
                            </Anchor>
                        )}
                        {privacyHref && (
                            <Anchor href={privacyHref} target="_blank" rel="noopener noreferrer" c="white" size="sm">
                                {t('SITE.PUBLIC.PRIVACY')}
                            </Anchor>
                        )}
                    </Group>
                )}
                <Divider my="lg" color="var(--site-footer-divider)" />
                <Text size="xs" c="var(--site-on-primary-muted)">
                    {t('SITE.PUBLIC.POWERED_BY')}{' '}
                    <Anchor href="https://univocal.de" target="_blank" rel="noopener noreferrer" c="white" fw={700}>
                        Univocal
                    </Anchor>
                </Text>
                <Group gap="md" mt={6}>
                    <Anchor
                        href="https://univocal.de/service/imprint"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        c="var(--site-on-primary-muted)"
                    >
                        {t('SITE.PUBLIC.PLATFORM_IMPRINT')}
                    </Anchor>
                    <Anchor
                        href="https://univocal.de/service/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        c="var(--site-on-primary-muted)"
                    >
                        {t('SITE.PUBLIC.PLATFORM_PRIVACY')}
                    </Anchor>
                </Group>
            </Container>
        </Box>
    );
};

const FooterLine = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
    <Group gap={8} wrap="nowrap">
        {icon}
        <Text size="sm" component="div" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            {children}
        </Text>
    </Group>
);

export default PublicEventFooter;
