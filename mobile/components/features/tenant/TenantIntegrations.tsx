import React from 'react';
import { Card, Flex, Switch, Text } from '@eduinteractive/balladui';
import { Tenant } from '@/api/Tenant';

interface TenantIntegrationsProps {
    tenant?: Tenant;
    onUpdate: (data: { integrations: Partial<Tenant['integrations']> }) => void;
}

const TenantIntegrations: React.FC<TenantIntegrationsProps> = ({ tenant, onUpdate }) => {
    if (!tenant) return null;

    const integrationLabels = {
        dashboard: 'Dashboard',
        documentation: 'Dokumentation',
        calendar: 'Kalender',
        survey: 'Umfragen',
        chat: 'Chat',
        budget: 'Budget',
        knowledge: 'Wissensdatenbank',
        event: 'Veranstaltungen',
        project: 'Projekte',
    };

    const handleToggle = (key: keyof Tenant['integrations'], value: boolean) => {
        onUpdate({
            integrations: {
                [key]: value,
            },
        });
    };

    return (
        <Card p="md" variant="filled">
            <Flex direction="column" gap="sm">
                <Text fs="lg" fw="bold">
                    Integrationen
                </Text>
                <Text fs="sm" c="gray.6" mb="md">
                    Aktivieren oder deaktivieren Sie Module für Ihre Gruppe
                </Text>
                
                <Flex direction="column" gap="sm">
                    {Object.entries(integrationLabels).map(([key, label]) => (
                        <Flex key={key} direction="row" justify="space-between" align="center" py="sm">
                            <Text fs="md" style={{ flex: 1 }}>
                                {label}
                            </Text>
                            <Switch
                                checked={tenant.integrations[key as keyof Tenant['integrations']]}
                                onChange={(value: boolean) => 
                                    handleToggle(key as keyof Tenant['integrations'], value)
                                }
                                size="md"
                            />
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Card>
    );
};

export default TenantIntegrations; 