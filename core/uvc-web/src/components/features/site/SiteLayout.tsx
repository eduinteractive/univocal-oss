import {
    Anchor,
    Avatar,
    Box,
    Burger,
    Container,
    Divider,
    Drawer,
    Group,
    SimpleGrid,
    Stack,
    Text,
    UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandInstagram, IconLink, IconMail, IconPhone, IconUser, IconWorld } from '@tabler/icons-react';
import { ProfileSiteLegalNotice, PublicSite } from '@eduinteractive/uvc-api';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../../../context/SiteContext';
import { profileImageUrl } from '../../../utils/SiteHost';
import { legalHtmlIsEmpty } from './legalHtml';
import { displayUrl, externalUrl, instagramHandle, instagramUrl } from './siteLinks';
import { SiteThemeProvider, useSiteTheme } from './SiteThemeContext';
import classes from './site.module.css';

interface SiteLayoutProps {
    data: PublicSite;
    children: ReactNode;
}

const SiteLayout = ({ data, children }: SiteLayoutProps) => (
    <SiteThemeProvider appearance={data.site.appearance}>
        <SiteFrame data={data}>{children}</SiteFrame>
    </SiteThemeProvider>
);

const SiteFrame = ({ data, children }: SiteLayoutProps) => {
    const { t } = useTranslation();
    const { basePath, mobile, preview } = useSite();
    const { vars } = useSiteTheme();
    const location = useLocation();
    const [opened, { toggle, close }] = useDisclosure(false);

    const logo = data.site.logoImage || data.profile.avatarImage;
    const home = basePath || '/';
    const navItems = [
        { label: t('SITE.PUBLIC.HOME'), to: home },
        ...data.pagesNav.map((page) => ({ label: page.title, to: `${basePath}/p/${page.slug}` })),
    ];

    const isActive = (to: string) =>
        to === home ? location.pathname === home || location.pathname === `${basePath}/` : location.pathname === to;

    const links = (vertical: boolean) =>
        navItems.map((item) => (
            <Anchor
                key={item.to}
                component={Link}
                to={item.to}
                onClick={close}
                underline="never"
                fw={isActive(item.to) ? 700 : 500}
                c={isActive(item.to) ? 'var(--site-primary)' : 'dark.5'}
                size={vertical ? 'lg' : 'sm'}
                aria-current={isActive(item.to) ? 'page' : undefined}
                style={
                    !vertical && isActive(item.to)
                        ? { borderBottom: '2px solid var(--site-primary)', paddingBottom: 2 }
                        : undefined
                }
            >
                {item.label}
            </Anchor>
        ));

    const { contactPerson, contactEmail, contactPhone, contactWebsite } = data.profile;
    const hasContact = contactPerson || contactEmail || contactPhone || contactWebsite;
    const { instagram, other } = data.site.socialLinks ?? {};
    const hasSocial = !!(instagram || other);
    const privacyLink = legalLink(data.site.legal?.privacy, `${basePath}/datenschutz`);
    const imprintLink = legalLink(data.site.legal?.imprint, `${basePath}/impressum`);

    return (
        <Box
            mih={preview ? undefined : '100vh'}
            bg="var(--site-page)"
            style={{ ...vars, display: 'flex', flexDirection: 'column' }}
        >
            {!preview && (
                <a href="#site-main" className={classes.skipLink}>
                    {t('SITE.PUBLIC.SKIP_TO_CONTENT')}
                </a>
            )}
            <Box
                component="header"
                bg="white"
                style={{
                    position: preview ? 'relative' : 'sticky',
                    top: 0,
                    zIndex: preview ? 1 : 100,
                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
            >
                <Container size="lg" h={64}>
                    <Group h="100%" justify="space-between" wrap="nowrap">
                        <UnstyledButton component={Link} to={home}>
                            <Group gap="sm" wrap="nowrap">
                                <Avatar src={profileImageUrl(logo)} radius="md" size={40} color="var(--site-primary)">
                                    {data.tenant.title.slice(0, 2).toUpperCase()}
                                </Avatar>
                                <Text fw={800} c="var(--site-primary)" lineClamp={1}>
                                    {data.tenant.title}
                                </Text>
                            </Group>
                        </UnstyledButton>
                        {navItems.length > 1 &&
                            (mobile ? (
                                <Burger opened={opened} onClick={toggle} size="sm" aria-label={t('SITE.PUBLIC.MENU')} />
                            ) : (
                                <>
                                    <Group gap="lg" visibleFrom="sm" wrap="nowrap" component="nav">
                                        {links(false)}
                                    </Group>
                                    <Burger
                                        opened={opened}
                                        onClick={toggle}
                                        hiddenFrom="sm"
                                        size="sm"
                                        aria-label={t('SITE.PUBLIC.MENU')}
                                    />
                                </>
                            ))}
                    </Group>
                </Container>
            </Box>

            <Drawer
                opened={opened}
                onClose={close}
                position="right"
                size="85%"
                title={data.tenant.title}
                style={vars}
                withinPortal={!preview}
                lockScroll={!preview}
                trapFocus={!preview}
            >
                <Stack gap="md">{links(true)}</Stack>
            </Drawer>

            <Box component="main" id="site-main" style={{ flex: 1 }}>
                {children}
            </Box>

            <Box component="footer" bg="var(--site-footer)" c="white" mt="xl">
                <Container size="lg" py={40}>
                    <SimpleGrid cols={mobile ? 1 : { base: 1, sm: hasSocial ? 3 : 2 }} spacing="xl">
                        <Stack gap={6}>
                            <Text fw={800} size="lg">
                                {data.tenant.title}
                            </Text>
                            {hasContact && (
                                <Stack gap={6} mt={4}>
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
                                            <Anchor
                                                href={externalUrl(contactWebsite)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                c="white"
                                            >
                                                {displayUrl(contactWebsite)}
                                            </Anchor>
                                        </FooterLine>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                        <Stack gap={6}>
                            <FooterHeading>{t('SITE.PUBLIC.FOOTER_PAGES')}</FooterHeading>
                            {navItems.map((item) => (
                                <Anchor key={item.to} component={Link} to={item.to} c="white" size="sm">
                                    {item.label}
                                </Anchor>
                            ))}
                        </Stack>
                        {hasSocial && (
                            <Stack gap={6}>
                                <FooterHeading>{t('SITE.PUBLIC.FOOTER_SOCIAL')}</FooterHeading>
                                {instagram && (
                                    <FooterLine icon={<IconBrandInstagram size={16} />}>
                                        <Anchor
                                            href={instagramUrl(instagram)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            c="white"
                                        >
                                            {instagramHandle(instagram)}
                                        </Anchor>
                                    </FooterLine>
                                )}
                                {other && (
                                    <FooterLine icon={<IconLink size={16} />}>
                                        <Anchor
                                            href={externalUrl(other)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            c="white"
                                        >
                                            {displayUrl(other)}
                                        </Anchor>
                                    </FooterLine>
                                )}
                            </Stack>
                        )}
                    </SimpleGrid>
                    {(privacyLink || imprintLink) && (
                        <Group gap="lg" mt="xl">
                            {imprintLink && (
                                <LegalAnchor link={imprintLink}>{t('SITE.PUBLIC.IMPRINT')}</LegalAnchor>
                            )}
                            {privacyLink && (
                                <LegalAnchor link={privacyLink}>{t('SITE.PUBLIC.PRIVACY')}</LegalAnchor>
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
        </Box>
    );
};

type LegalLink = { external: true; href: string } | { external: false; to: string };

const legalLink = (notice: ProfileSiteLegalNotice | undefined, path: string): LegalLink | undefined => {
    if (notice?.mode === 'link' && notice.url) return { external: true, href: externalUrl(notice.url) };
    if (notice?.mode !== 'link' && !legalHtmlIsEmpty(notice?.text)) return { external: false, to: path };
    return undefined;
};

const LegalAnchor = ({ link, children }: { link: LegalLink; children: ReactNode }) =>
    link.external ? (
        <Anchor href={link.href} target="_blank" rel="noopener noreferrer" c="white" size="sm">
            {children}
        </Anchor>
    ) : (
        <Anchor component={Link} to={link.to} c="white" size="sm">
            {children}
        </Anchor>
    );

const FooterHeading = ({ children }: { children: ReactNode }) => (
    <Text size="xs" tt="uppercase" fw={700} lts={0.6} c="var(--site-on-primary-muted)" mb={2}>
        {children}
    </Text>
);

const FooterLine = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
    <Group gap={8} wrap="nowrap">
        {icon}
        <Text size="sm" component="div" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            {children}
        </Text>
    </Group>
);

export default SiteLayout;
