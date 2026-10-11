import { Button, Card, SimpleGrid, Stack, Text, ThemeIcon, Title, UnstyledButton } from '@mantine/core';
import { IconCheck, IconClipboard, IconRegistered } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type EventModuleId = 'program' | 'registration' | 'checkin';

export const eventModuleOptions: {
    id: EventModuleId;
    icon: typeof IconClipboard;
    color: string;
    titleKey: string;
    descriptionKey: string;
}[] = [
    {
        id: 'program',
        icon: IconClipboard,
        color: 'violet',
        titleKey: 'EVENTS.MODULES.PROGRAM_TITLE',
        descriptionKey: 'EVENTS.MODULES.PROGRAM_DESCRIPTION',
    },
    {
        id: 'registration',
        icon: IconRegistered,
        color: 'blue',
        titleKey: 'EVENTS.MODULES.REGISTRATION_TITLE',
        descriptionKey: 'EVENTS.MODULES.REGISTRATION_DESCRIPTION',
    },
    {
        id: 'checkin',
        icon: IconCheck,
        color: 'teal',
        titleKey: 'EVENTS.MODULES.CHECKIN_TITLE',
        descriptionKey: 'EVENTS.MODULES.CHECKIN_DESCRIPTION',
    },
];

interface EventModuleCardProps {
    icon: typeof IconClipboard;
    color: string;
    title: string;
    description: string;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
}

export const EventModuleCard = (props: EventModuleCardProps) => {
    const Icon = props.icon;
    return (
        <UnstyledButton
            w="100%"
            h="100%"
            disabled={props.disabled}
            aria-pressed={props.active}
            aria-label={props.title}
            onClick={props.onClick}
        >
            <Card
                withBorder
                radius="sm"
                p="md"
                h="100%"
                bg={props.active ? `${props.color}.0` : undefined}
                style={{
                    borderColor: props.active ? `var(--mantine-color-${props.color}-6)` : undefined,
                }}
            >
                <ThemeIcon variant="light" color={props.color} size="md" radius="sm" mb="sm">
                    <Icon size={18} stroke={1.5} />
                </ThemeIcon>
                <Text fw={600} size="sm">{props.title}</Text>
                <Text size="sm" c="dimmed" mt={4}>{props.description}</Text>
            </Card>
        </UnstyledButton>
    );
};

interface EventModulePickerProps {
    disabled?: boolean;
    onActivate: (modules: EventModuleId[]) => void;
}

const EventModulePicker = (props: EventModulePickerProps) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<EventModuleId[]>([]);

    const toggle = (id: EventModuleId) => {
        setSelected((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    return (
        <Stack gap="md" w="100%">
            <div>
                <Title order={3} c="violet">
                    {t('EVENTS.MODULES.TITLE')}
                </Title>
                <Text size="sm" c="dimmed" mt={4}>
                    {t('EVENTS.MODULES.HINT')}
                </Text>
            </div>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                {eventModuleOptions.map((option) => (
                    <EventModuleCard
                        key={option.id}
                        icon={option.icon}
                        color={option.color}
                        title={t(option.titleKey)}
                        description={t(option.descriptionKey)}
                        active={selected.includes(option.id)}
                        disabled={props.disabled}
                        onClick={() => toggle(option.id)}
                    />
                ))}
            </SimpleGrid>
            <Button
                w="fit-content"
                disabled={props.disabled || selected.length === 0}
                onClick={() => props.onActivate(selected)}
            >
                {t('EVENTS.MODULES.ACTIVATE')}
            </Button>
        </Stack>
    );
};

export default EventModulePicker;
