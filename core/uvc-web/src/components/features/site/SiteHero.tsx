import { Avatar, Box, Card, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { PublicSite } from '@eduinteractive/uvc-api';
import { ReactNode } from 'react';
import { profileImageUrl } from '../../../utils/SiteHost';
import SiteHtml from './SiteHtml';
import { useSiteTheme } from './SiteThemeContext';
import classes from './site.module.css';

interface SiteHeroProps {
    data: PublicSite;
    /** Builder slots rendered on top of the hero (edit buttons). */
    logoAction?: ReactNode;
    descriptionAction?: ReactNode;
}

const SiteHero = ({ data, logoAction, descriptionAction }: SiteHeroProps) => {
    const { layoutTokens } = useSiteTheme();
    const logo = data.site.logoImage || data.profile.avatarImage;
    const background = profileImageUrl(data.profile.backgroundImage);
    const mediaStyle = {
        background: background
            ? `center / cover no-repeat url("${background}")`
            : 'var(--site-hero-gradient)',
    };

    if (layoutTokens.heroStyle === 'overlay') {
        return (
            <Box
                pos="relative"
                mih={layoutTokens.bannerHeight}
                className={classes.heroOverlay}
                style={mediaStyle}
            >
                <Box className={classes.heroOverlayScrim} aria-hidden />
                <Container size="lg" pos="relative" style={{ zIndex: 1 }} py={{ base: 36, sm: 56 }}>
                    <Stack gap="md" maw={720}>
                        <Box pos="relative" w="fit-content">
                            <Avatar
                                src={profileImageUrl(logo)}
                                size={80}
                                radius="var(--site-radius)"
                                color="var(--site-primary)"
                                style={{ border: '3px solid rgba(255,255,255,0.85)' }}
                            >
                                {data.tenant.title.slice(0, 2).toUpperCase()}
                            </Avatar>
                            {logoAction && (
                                <Box pos="absolute" bottom={-6} right={-6}>
                                    {logoAction}
                                </Box>
                            )}
                        </Box>
                        <Group justify="space-between" wrap="nowrap" align="flex-start">
                            <Title order={1} c="white" fz={{ base: 30, sm: 44 }} className={classes.title}>
                                {data.tenant.title}
                            </Title>
                            {descriptionAction}
                        </Group>
                        {data.profile.description ? (
                            <Box c="rgba(255,255,255,0.92)" className={classes.heroOverlayCopy}>
                                <SiteHtml html={data.profile.description} />
                            </Box>
                        ) : (
                            data.tenant.description && (
                                <Text c="rgba(255,255,255,0.88)" maw="65ch" size="lg">
                                    {data.tenant.description}
                                </Text>
                            )
                        )}
                    </Stack>
                </Container>
            </Box>
        );
    }

    if (layoutTokens.heroStyle === 'split') {
        return (
            <Container size="lg" mt="lg" mb="md">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0} className={classes.heroSplit}>
                    <Box className={classes.heroSplitBrand} p={{ base: 'lg', sm: 'xl' }}>
                        <Stack gap="md" h="100%" justify="center">
                            <Box pos="relative" w="fit-content">
                                <Avatar
                                    src={profileImageUrl(logo)}
                                    size={88}
                                    radius="var(--site-radius)"
                                    color="var(--site-primary)"
                                    style={{ border: '4px solid white', boxShadow: 'var(--mantine-shadow-sm)' }}
                                >
                                    {data.tenant.title.slice(0, 2).toUpperCase()}
                                </Avatar>
                                {logoAction && (
                                    <Box pos="absolute" bottom={-6} right={-6}>
                                        {logoAction}
                                    </Box>
                                )}
                            </Box>
                            <Group justify="space-between" wrap="nowrap" align="flex-start">
                                <Title
                                    order={1}
                                    c="var(--site-primary)"
                                    fz={{ base: 28, sm: 38 }}
                                    className={classes.title}
                                >
                                    {data.tenant.title}
                                </Title>
                                {descriptionAction}
                            </Group>
                            {data.profile.description ? (
                                <SiteHtml html={data.profile.description} />
                            ) : (
                                data.tenant.description && <Text c="dark.6">{data.tenant.description}</Text>
                            )}
                        </Stack>
                    </Box>
                    <Box mih={layoutTokens.bannerHeight} className={classes.heroSplitMedia} style={mediaStyle} />
                </SimpleGrid>
            </Container>
        );
    }

    // compact / overlap
    return (
        <Box>
            <Box h={layoutTokens.bannerHeight} style={mediaStyle} />
            <Container size="lg">
                <Card
                    radius="var(--site-radius)"
                    p={{ base: 'md', sm: 'lg' }}
                    mt={layoutTokens.cardOverlap}
                    shadow="sm"
                    withBorder
                >
                    <Group align="flex-start" gap="lg" wrap="wrap">
                        <Box pos="relative">
                            <Avatar
                                src={profileImageUrl(logo)}
                                size={72}
                                radius="var(--site-radius)"
                                color="var(--site-primary)"
                                style={{ border: '4px solid white', boxShadow: 'var(--mantine-shadow-sm)' }}
                            >
                                {data.tenant.title.slice(0, 2).toUpperCase()}
                            </Avatar>
                            {logoAction && (
                                <Box pos="absolute" bottom={-6} right={-6}>
                                    {logoAction}
                                </Box>
                            )}
                        </Box>
                        <Stack gap="xs" style={{ flex: 1, minWidth: 240 }}>
                            <Group justify="space-between" wrap="nowrap" align="flex-start">
                                <Title
                                    order={1}
                                    c="var(--site-primary)"
                                    fz={{ base: 24, sm: 30 }}
                                    className={classes.title}
                                >
                                    {data.tenant.title}
                                </Title>
                                {descriptionAction}
                            </Group>
                            {data.profile.description ? (
                                <SiteHtml html={data.profile.description} />
                            ) : (
                                data.tenant.description && <Text c="dark.6">{data.tenant.description}</Text>
                            )}
                        </Stack>
                    </Group>
                </Card>
            </Container>
        </Box>
    );
};

export default SiteHero;
