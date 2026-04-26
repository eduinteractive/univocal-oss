import { Box, Tabs, Title } from '@mantine/core';
import React from 'react';

interface SVHTabsProps {
    defaultValue?: string;
    children: React.ReactNode;
    title?: string;
}

const SVHTabs = (props: SVHTabsProps) => {
    return (
        <>
            <Box bg="blue" px="md" py="sm" pb={18}>
                <Title order={3} c="white">
                    {props.title}
                </Title>
            </Box>
            <Tabs defaultValue={props.defaultValue || "general"} styles={{}}>
                {props.children}
            </Tabs>
        </>
    );
};

export default SVHTabs;
