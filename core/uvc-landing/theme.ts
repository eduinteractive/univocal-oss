"use client";

import { createTheme, MantineColorsTuple } from "@mantine/core";

const ediColor: MantineColorsTuple = [
    '#ecf8fe',
    '#d8edf8',
    '#abdbf3',
    '#7dc7f0',
    '#5bb6ec',
    '#4aacea',
    '#3fa6eb',
    '#3391d1',
    '#2681bb',
    '#043853',
];

export const theme = createTheme({
    colors: {
        'edi-color': ediColor,
    },
    primaryColor: 'edi-color',
    primaryShade: { light: 9, dark: 9 },
});
