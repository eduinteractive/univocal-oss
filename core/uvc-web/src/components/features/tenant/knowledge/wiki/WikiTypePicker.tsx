import { Box, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconUsers, IconWriting } from '@tabler/icons-react';
import { WikiSectionType } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface WikiTypePickerProps {
    disabled?: boolean;
    onChoose: (type: WikiSectionType) => void;
}

const options: {
    type: WikiSectionType;
    tint: string;
    color: string;
    icon: typeof IconWriting;
    titleKey: string;
    descriptionKey: string;
}[] = [
    {
        type: 'editor',
        tint: 'violet.0',
        color: 'violet.6',
        icon: IconWriting,
        titleKey: 'KNOWLEDGE.WIKI.CONTENT.TYPE_EDITOR_TITLE',
        descriptionKey: 'KNOWLEDGE.WIKI.CONTENT.TYPE_EDITOR_DESCRIPTION',
    },
    {
        type: 'etherpad',
        tint: 'pink.0',
        color: 'pink.6',
        icon: IconUsers,
        titleKey: 'KNOWLEDGE.WIKI.CONTENT.TYPE_ETHERPAD_TITLE',
        descriptionKey: 'KNOWLEDGE.WIKI.CONTENT.TYPE_ETHERPAD_DESCRIPTION',
    },
];

const WikiTypePicker = (props: WikiTypePickerProps) => {
    const { t } = useTranslation();

    return (
        <Stack gap="lg" maw={720} w="100%">
            <Stack gap={4}>
                <Title order={3}>{t('KNOWLEDGE.WIKI.CONTENT.TYPE_TITLE')}</Title>
                <Text size="sm" c="dimmed">
                    {t('KNOWLEDGE.WIKI.CONTENT.TYPE_HINT')}
                </Text>
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {options.map((option) => {
                    const Icon = option.icon;
                    return (
                        <Paper
                            key={option.type}
                            component="button"
                            type="button"
                            withBorder
                            p="lg"
                            radius="md"
                            disabled={props.disabled}
                            aria-label={t(option.titleKey)}
                            onClick={() => props.onChoose(option.type)}
                            onMouseEnter={(event) => {
                                event.currentTarget.style.borderColor = 'var(--mantine-color-violet-6)';
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.borderColor = '';
                            }}
                            onFocus={(event) => {
                                event.currentTarget.style.borderColor = 'var(--mantine-color-violet-6)';
                            }}
                            onBlur={(event) => {
                                event.currentTarget.style.borderColor = '';
                            }}
                            style={{
                                textAlign: 'left',
                                cursor: props.disabled ? 'wait' : 'pointer',
                                background: 'var(--mantine-color-body)',
                                transition: 'border-color 120ms ease',
                            }}
                        >
                            <Stack gap="sm" align="flex-start">
                                <Box
                                    w={48}
                                    h={48}
                                    bg={option.tint}
                                    c={option.color}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 10,
                                    }}
                                >
                                    <Icon size={26} stroke={1.5} />
                                </Box>
                                <Text fw={600}>{t(option.titleKey)}</Text>
                                <Text size="sm" c="dimmed">
                                    {t(option.descriptionKey)}
                                </Text>
                            </Stack>
                        </Paper>
                    );
                })}
            </SimpleGrid>
        </Stack>
    );
};

export default WikiTypePicker;
