import { createTheme, MantineColorsTuple } from '@mantine/core';

/** Logo colors sit at index 6, the shade Mantine uses for filled variants. */
const violet: MantineColorsTuple = [
    '#eeecff',
    '#d9d5fb',
    '#b3abf2',
    '#8a7fe6',
    '#5f52d4',
    '#3a2cb8',
    '#120875',
    '#0e0660',
    '#0a044b',
    '#070337',
];

const pink: MantineColorsTuple = [
    '#ffeef5',
    '#ffd6e7',
    '#ffadcd',
    '#ff84b3',
    '#fd5f9c',
    '#fb4c91',
    '#f93a88',
    '#d92a72',
    '#b51f5d',
    '#8f1649',
];

const yellow: MantineColorsTuple = [
    '#fffbe6',
    '#fff4c2',
    '#ffec99',
    '#fde26b',
    '#fbd947',
    '#fad536',
    '#f9d128',
    '#dbb510',
    '#b39309',
    '#8a7105',
];

export const uvcTheme = createTheme({
    defaultRadius: 'sm',
    primaryColor: 'violet',
    primaryShade: 6,
    autoContrast: true,
    colors: { violet, pink, yellow },
});
