import { Box, Group, Text } from '@mantine/core';
import { PublicSite } from '@eduinteractive/uvc-api';
import { MouseEvent, ReactNode } from 'react';
import { SiteProvider } from '../../../../../context/SiteContext';
import { PROFILE_BASE_DOMAIN } from '../../../../../utils/SiteHost';
import SiteHome from '../../../site/SiteHome';
import SiteLayout from '../../../site/SiteLayout';

export type PreviewDevice = 'desktop' | 'mobile';

interface SitePreviewCanvasProps {
    data: PublicSite;
    device: PreviewDevice;
    editable?: boolean;
    logoAction?: ReactNode;
    descriptionAction?: ReactNode;
    galleryAction?: ReactNode;
    maxHeight?: number | string;
}

/** Links inside the preview must not navigate the builder away. */
const blockLinks = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    if (anchor) event.preventDefault();
};

const SitePreviewCanvas = ({
    data,
    device,
    editable,
    logoAction,
    descriptionAction,
    galleryAction,
    maxHeight = 'calc(100vh - 260px)',
}: SitePreviewCanvasProps) => {
    const isMobile = device === 'mobile';
    const host = data.site.subdomain ? `${data.site.subdomain}.${PROFILE_BASE_DOMAIN}` : `…${PROFILE_BASE_DOMAIN}`;

    return (
        <Box
            mx="auto"
            w={isMobile ? 390 : '100%'}
            maw="100%"
            style={{
                border: isMobile ? '8px solid var(--mantine-color-dark-8)' : '1px solid var(--mantine-color-gray-3)',
                borderRadius: isMobile ? 24 : 8,
                overflow: 'hidden',
                boxShadow: 'var(--mantine-shadow-sm)',
                background: 'white',
                transition: 'width 200ms ease',
            }}
        >
            {!isMobile && (
                <Group gap={6} px="sm" py={8} bg="gray.1" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
                        <Box key={color} w={10} h={10} style={{ borderRadius: '50%', background: color }} />
                    ))}
                    <Box
                        ml="sm"
                        px="sm"
                        py={2}
                        bg="white"
                        style={{ borderRadius: 6, flex: 1, maxWidth: 420, border: '1px solid var(--mantine-color-gray-3)' }}
                    >
                        <Text size="xs" c="dimmed" truncate>
                            https://{host}
                        </Text>
                    </Box>
                </Group>
            )}
            <Box
                style={{
                    maxHeight,
                    overflowY: 'auto',
                    position: 'relative',
                    /* Fixed menu stays inside this frame instead of the builder page. */
                    transform: 'translateZ(0)',
                }}
                onClickCapture={blockLinks}
            >
                <SiteProvider
                    subdomain={data.site.subdomain}
                    basePath={data.site.subdomain ? `/g/${data.site.subdomain}` : ''}
                    preview
                    mobile={isMobile}
                >
                    <SiteLayout data={data}>
                        <SiteHome
                            data={data}
                            showEmpty={editable}
                            logoAction={logoAction}
                            descriptionAction={descriptionAction}
                            galleryAction={galleryAction}
                        />
                    </SiteLayout>
                </SiteProvider>
            </Box>
        </Box>
    );
};

export default SitePreviewCanvas;
