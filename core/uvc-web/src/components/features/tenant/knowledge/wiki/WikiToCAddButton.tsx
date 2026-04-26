import { ActionIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface WikiToCAddButtonProps {
    onAdd: () => void;
}

const WikiToCAddButton = (props: WikiToCAddButtonProps) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
            }}
        >
            <div
                style={{
                    flex: 1,
                    borderBottom: '1px solid #e1e1e1',
                    marginRight: '10px',
                }}
            />
            <ActionIcon
                variant="subtle"
                onClick={() => props.onAdd()}
            >
                <IconPlus size={24} />
            </ActionIcon>
            <div
                style={{
                    flex: 1,
                    borderBottom: '1px solid #e1e1e1',
                    marginLeft: '10px',
                }}
            />
        </div>
    );
};

export default WikiToCAddButton;
