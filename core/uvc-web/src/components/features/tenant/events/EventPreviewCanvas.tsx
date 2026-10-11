import { Box, Group, Text } from '@mantine/core';
import { SVHPublicEvent } from '@eduinteractive/uvc-api';
import { MouseEvent } from 'react';
import { SiteProvider } from '../../../../context/SiteContext';
import PublicEvent from '../../../../pages/PublicEvent';
import { usePublicEventUrl } from './usePublicEventUrl';

export type PreviewDevice = 'desktop' | 'mobile';

interface EventPreviewCanvasProps {
    event: SVHPublicEvent;
    eventId: string;
    coverUrl?: string | null;
    device: PreviewDevice;
    maxHeight?: number | string;
}

const blockLinks = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest('a');
    if (anchor) event.preventDefault();
};

const EventPreviewCanvas = ({
    event,
    eventId,
    coverUrl,
    device,
    maxHeight = 480,
}: EventPreviewCanvasProps) => {
    const isMobile = device === 'mobile';
    const host = usePublicEventUrl(eventId).replace(/^https?:\/\//, '');

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
                            {host}
                        </Text>
                    </Box>
                </Group>
            )}
            <Box
                style={{ maxHeight, overflowY: 'auto', position: 'relative' }}
                onClickCapture={blockLinks}
            >
                <SiteProvider basePath="" preview mobile={isMobile}>
                    <PublicEvent
                        previewEvent={event}
                        previewEventId={eventId}
                        previewCoverUrl={coverUrl}
                    />
                </SiteProvider>
            </Box>
        </Box>
    );
};

export default EventPreviewCanvas;
