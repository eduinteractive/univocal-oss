import { Badge, Button, Card, Group, Progress, RingProgress, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCheck, IconCircleDashed, IconConfetti } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SetupAction, SetupStep, setupProgress } from '../setupChecklist';

interface SetupTabProps {
    steps: SetupStep[];
    onAction: (action: SetupAction, tab?: string) => void;
    compact?: boolean;
}

const SetupTab = ({ steps, onAction, compact }: SetupTabProps) => {
    const { t } = useTranslation();
    const progress = setupProgress(steps);
    const nextStep = steps.find((step) => !step.done && !step.optional);

    if (compact) {
        return (
            <Card withBorder radius="sm" p="lg" bg="lavender.0">
                <Group justify="space-between" mb={8}>
                    <Title order={6} c="navy.9">
                        {t('SITE.SETUP.TITLE')}
                    </Title>
                    <Text size="xs" fw={700} c="navy.9">
                        {progress.done}/{progress.total}
                    </Text>
                </Group>
                <Progress value={progress.percent} color="navy.9" size="sm" radius="sm" mb="md" />
                {nextStep ? (
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="xs" c="dimmed">
                            {t('SITE.SETUP.NEXT')}: <b>{t(`SITE.SETUP.STEPS.${nextStep.key}.TITLE`)}</b>
                        </Text>
                        <Button size="compact-xs" color="navy.9" onClick={() => onAction(nextStep.action, nextStep.tab)}>
                            {t('SITE.SETUP.GO')}
                        </Button>
                    </Group>
                ) : (
                    <Text size="xs" c="green.8" fw={600}>
                        {t('SITE.SETUP.ALL_DONE')}
                    </Text>
                )}
            </Card>
        );
    }

    return (
        <Stack gap="lg">
            <Card withBorder radius="sm" p="xl">
                <Group wrap="nowrap" gap="lg">
                    <RingProgress
                        size={96}
                        thickness={9}
                        sections={[{ value: progress.percent, color: 'navy.9' }]}
                        label={
                            <Text ta="center" fw={800} c="navy.9">
                                {progress.percent}%
                            </Text>
                        }
                    />
                    <div>
                        <Title order={3} c="blue">
                            {progress.done === progress.total ? t('SITE.SETUP.ALL_DONE') : t('SITE.SETUP.TITLE')}
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            {t('SITE.SETUP.DESCRIPTION')}
                        </Text>
                    </div>
                    {progress.done === progress.total && (
                        <ThemeIcon size={48} radius="md" color="green" variant="light" ml="auto">
                            <IconConfetti size={28} />
                        </ThemeIcon>
                    )}
                </Group>
            </Card>
            {steps.map((step) => (
                <Card key={step.key} withBorder radius="sm" p="lg" bg={step.done ? 'gray.0' : undefined}>
                    <Group justify="space-between" wrap="nowrap" gap="md">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                            <ThemeIcon
                                radius="md"
                                size="md"
                                color={step.done ? 'green' : 'gray'}
                                variant={step.done ? 'filled' : 'light'}
                            >
                                {step.done ? <IconCheck size={16} /> : <IconCircleDashed size={16} />}
                            </ThemeIcon>
                            <div style={{ minWidth: 0 }}>
                                <Group gap={6}>
                                    <Text fw={600} size="sm" td={step.done ? 'line-through' : undefined}>
                                        {t(`SITE.SETUP.STEPS.${step.key}.TITLE`)}
                                    </Text>
                                    {step.optional && (
                                        <Badge size="xs" variant="light" radius="sm" color="gray">
                                            {t('SITE.SETUP.OPTIONAL')}
                                        </Badge>
                                    )}
                                </Group>
                                <Text size="xs" c="dimmed">
                                    {t(`SITE.SETUP.STEPS.${step.key}.DESCRIPTION`)}
                                </Text>
                            </div>
                        </Group>
                        {!step.done && (
                            <Button
                                variant="light"
                                onClick={() => onAction(step.action, step.tab)}
                            >
                                {t('SITE.SETUP.GO')}
                            </Button>
                        )}
                    </Group>
                </Card>
            ))}
        </Stack>
    );
};

export default SetupTab;
