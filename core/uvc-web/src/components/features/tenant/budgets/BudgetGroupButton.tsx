import { Button, Group, Text } from '@mantine/core';
import { IconNewSection } from '@tabler/icons-react';

interface BudgetGroupButtonProps {
    title: string;
    onAdd: () => void;
}

const BudgetGroupButton = (props: BudgetGroupButtonProps) => {
    return (
        <Group justify="right">
            <Button variant="default" size="xs" onClick={props.onAdd}>
                <IconNewSection />
                <Text ml="xs" size="sm">{props.title}</Text>
            </Button>
        </Group>
    );
};

export default BudgetGroupButton;
