import { Container, ContainerProps } from "@mantine/core";
import React from "react";

interface SVHPageWrapperProps {
    p: ContainerProps["p"];
    children: React.ReactNode | React.ReactNode[]
}

const SVHPageWrapper = (props: SVHPageWrapperProps) => {
    return (
        <Container fluid p={props.p} h="100%">
            {props.children}
        </Container>
    )
}

export default SVHPageWrapper;