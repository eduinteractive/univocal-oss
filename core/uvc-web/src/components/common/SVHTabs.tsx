import { Box, Tabs, Title } from '@mantine/core';
import React from 'react';

interface SVHTabsProps {
    defaultValue?: string;
    value?: string;
    onChange?: (value: string | null) => void;
    children: React.ReactNode;
    title?: string;
}

const SVHTabs = (props: SVHTabsProps) => {
    return (
        <>
            <Box bg="violet" px="md" py="sm" pb={18}>
                <Title order={3} c="white">
                    {props.title}
                </Title>
            </Box>
            <Tabs
                defaultValue={props.value ? undefined : props.defaultValue || "general"}
                value={props.value}
                onChange={props.onChange}
                styles={{}}
            >
                {props.children}
            </Tabs>
        </>
    );
};

export default SVHTabs;
