import {
    ActionIcon,
    Box,
    Card,
    Container,
    Flex,
    Group,
    Paper,
    Text,
    Title,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import SVHTitle from '../components/common/SVHTitle';
import { useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import SVHLoader from '../components/common/SVHLoader';
import HTTP_403 from './error/HTTP_403';
import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const EventProgram = () => {
    const { t } = useTranslation();
    const { eventId } = useParams();

    const eventQuery = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => SAPI.EVENT.PUBLIC.getPublicEvent({ eventId: eventId! }),
    });

    if (eventQuery.isLoading) {
        return <SVHLoader />;
    }

    if (eventQuery.isError) {
        return <HTTP_403 />;
    }

    if (!eventQuery.data?.config?.toc.enabled) {
        return (
            <HTTP_403
                title={t('PAGES.EVENT.PROGRAM.NO_ACCESS_TITLE')}
                description={t('PAGES.EVENT.PROGRAM.NO_ACCESS_DESCRIPTION')}
            />
        );
    }

    return (
        <Container h="100%" size="xl" w="100%" mt="xl" pb="xl">
            <Flex direction="column" gap="md" pb="xl">
                <Card withBorder p="sm" radius="md" shadow="sm" w="100%">
                    <SVHTitle />
                </Card>
            </Flex>
            <Card withBorder p="sm" radius="md" shadow="sm" w="100%">
                <Title order={4} ta="center" py="md">
                    {eventQuery.data?.title}
                </Title>
                <Box p="md" w="100%">
                    <Title order={5} c="dimmed" mb="xs">
                        {t('PAGES.EVENT.PROGRAM.PROGRAM_TITLE')}
                    </Title>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: eventQuery.data?.config.toc.content,
                        }}
                    />
                </Box>
                {eventQuery.data?.config.toc.materials.length > 0 && (
                    <Box p="md" w="100%">
                        <Title order={5} c="dimmed" mb="xs">
                            {t('PAGES.EVENT.PROGRAM.MATERIALS_TITLE')}
                        </Title>

                        {eventQuery.data?.config.toc.materials.map(
                            (material) => (
                                <Paper
                                    withBorder
                                    p="xs"
                                    key={material.link}
                                    style={{ borderRadius: 0 }}
                                >
                                    <Group
                                        justify="space-between"
                                        wrap="nowrap"
                                    >
                                        <Text>{material.title}</Text>
                                        <Group gap="xs" wrap="nowrap">
                                            <ActionIcon
                                                variant="subtle"
                                                onClick={() =>
                                                    window.open(
                                                        `${
                                                            import.meta.env
                                                                .VITE_KUBERNETES_HOST
                                                        }/api/event/public/event/${eventId}/download/${encodeURIComponent(
                                                            material.link
                                                        )}`,
                                                        '_blank'
                                                    )
                                                }
                                            >
                                                <IconDownload size={24} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                </Paper>
                            )
                        )}
                    </Box>
                )}
            </Card>
        </Container>
    );
};

export default EventProgram;
