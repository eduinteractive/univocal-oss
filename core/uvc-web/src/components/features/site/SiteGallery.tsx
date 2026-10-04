import { ActionIcon, Box, Card, Group, Image, SimpleGrid } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useRef } from 'react';
import { profileImageUrl } from '../../../utils/SiteHost';
import { useSiteTheme } from './SiteThemeContext';
import classes from './site.module.css';

interface SiteGalleryProps {
    images: string[];
}

const SiteGallery = ({ images }: SiteGalleryProps) => {
    const { layoutTokens } = useSiteTheme();
    const trackRef = useRef<HTMLDivElement>(null);

    if (images.length === 0) return null;

    if (layoutTokens.galleryStyle === 'mosaic') {
        return (
            <SimpleGrid cols={{ base: 2, sm: images.length === 1 ? 1 : 3 }} spacing="sm">
                {images.map((image, index) => (
                    <Box
                        key={image}
                        className={classes.galleryMosaicCell}
                        style={{
                            gridColumn: index === 0 && images.length > 1 ? 'span 2' : undefined,
                        }}
                    >
                        <Image
                            src={profileImageUrl(image)}
                            alt={`Bild ${index + 1}`}
                            h={index === 0 && images.length > 1 ? { base: 180, sm: 260 } : 160}
                            radius="var(--site-radius)"
                            fit="cover"
                            loading="lazy"
                        />
                    </Box>
                ))}
            </SimpleGrid>
        );
    }

    if (layoutTokens.galleryStyle === 'bleed') {
        return (
            <Box className={classes.galleryBleed}>
                <Box
                    ref={trackRef}
                    className={classes.galleryTrack}
                    style={{ gap: 16 }}
                >
                    {images.map((image, index) => (
                        <Box key={image} className={classes.galleryBleedSlide}>
                            <Image
                                src={profileImageUrl(image)}
                                alt={`Bild ${index + 1}`}
                                h={{ base: 200, sm: 280 }}
                                radius="var(--site-radius)"
                                fit="cover"
                                loading="lazy"
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    }

    const scroll = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
    };

    return (
        <Card withBorder radius="var(--site-radius)" p="md">
            <Group wrap="nowrap" gap="xs" align="center">
                <ActionIcon
                    variant="subtle"
                    color="var(--site-primary)"
                    size="lg"
                    onClick={() => scroll(-1)}
                    aria-label="Zurück"
                >
                    <IconChevronLeft />
                </ActionIcon>
                <Box ref={trackRef} className={classes.galleryTrack} style={{ gap: 12, flex: 1 }}>
                    {images.map((image, index) => (
                        <Box key={image} className={classes.galleryCardSlide}>
                            <Image
                                src={profileImageUrl(image)}
                                alt={`Bild ${index + 1}`}
                                h={160}
                                radius="md"
                                fit="cover"
                                loading="lazy"
                            />
                        </Box>
                    ))}
                </Box>
                <ActionIcon
                    variant="subtle"
                    color="var(--site-primary)"
                    size="lg"
                    onClick={() => scroll(1)}
                    aria-label="Weiter"
                >
                    <IconChevronRight />
                </ActionIcon>
            </Group>
        </Card>
    );
};

export default SiteGallery;
