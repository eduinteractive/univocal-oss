import { Button, Card, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface TenantIntegrationProps {
    title: string;
    subtitle: string;
    description: string;
    active: boolean;
    onClick?: () => void;
}

const TenantIntegration = (props: TenantIntegrationProps) => {
    const { t } = useTranslation();
    return (
        <Card withBorder shadow="sm" h="100%">
            <Card.Section p="md" ta="center">
                <Title order={5} c="blue">
                    {props.title}
                </Title>
                <Text size="sm" c="dimmed">
                    {props.subtitle}
                </Text>
                <Text size="sm" mt="sm">
                    {props.description}
                </Text>
                {props.active && (
                    <Button  mt="sm" onClick={props.onClick}>
                        {t('TENANT.INTEGRATIONS.ACTIVATED')}
                    </Button>
                )}
                {!props.active && (
                    <Button variant='outline'  mt="sm" onClick={props.onClick}>
                        {t('TENANT.INTEGRATIONS.DEACTIVATED')}
                    </Button>
                )}
            </Card.Section>
        </Card>
    );
};

export default TenantIntegration;
