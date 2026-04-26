import React from 'react';
import { Card, Flex, Switch, Text } from '@eduinteractive/balladui';

interface TenantMiscProps {
    settings: {
        calendarTokenStatus: boolean;
    };
    onCalendarExport: () => void;
}

const TenantMisc: React.FC<TenantMiscProps> = ({ settings, onCalendarExport }) => {
    return (
        <Card p="md" variant="filled">
            <Flex direction="column" gap="sm">
                <Text fs="lg" fw="bold">
                    Sonstige Einstellungen
                </Text>
                <Text fs="sm" c="gray.6" mb="md">
                    Weitere Konfigurationsoptionen für Ihre Gruppe
                </Text>
                
                <Flex direction="column" gap="sm">
                    <Flex direction="row" justify="space-between" align="center" py="sm">
                        <Flex direction="column" style={{ flex: 1 }}>
                            <Text fs="md">
                                Gruppenkalender freigeben
                            </Text>
                            <Text fs="sm" c="gray.6">
                                Ermöglicht den Export des Gruppenkalenders
                            </Text>
                        </Flex>
                        <Switch
                            checked={settings.calendarTokenStatus}
                            onChange={onCalendarExport}
                            size="md"
                        />
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    );
};

export default TenantMisc; 