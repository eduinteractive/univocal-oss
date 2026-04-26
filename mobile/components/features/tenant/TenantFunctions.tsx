import React from 'react';
import { Card, Flex, Text, Button } from '@eduinteractive/balladui';
import { IconSend } from '@/assets/icons/Icon';

interface TenantFunctionsProps {
    onNotification: () => void;
}

const TenantFunctions: React.FC<TenantFunctionsProps> = ({ onNotification }) => {
    return (
        <Card p="md" variant="filled">
            <Flex direction="column" gap="sm">
                <Text fs="lg" fw="bold">
                    Funktionen
                </Text>
                <Text fs="sm" c="gray.6" mb="md">
                    Verwaltungsfunktionen für Ihre Gruppe
                </Text>
                
                <Flex direction="column" gap="sm">
                    <Button
                        onPress={onNotification}
                        variant="outline"
                        size="md"
                        style={{ borderWidth: 1 }}
                    >
                        <IconSend size={16} />
                        <Text ml="xs">Benachrichtigung senden</Text>
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );
};

export default TenantFunctions; 