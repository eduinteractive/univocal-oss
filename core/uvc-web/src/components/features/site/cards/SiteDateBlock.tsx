import { Box, Text } from '@mantine/core';
import dayjs from 'dayjs';
import classes from '../site.module.css';

interface SiteDateBlockProps {
    date: Date | string;
    size?: 'sm' | 'md';
    /** Filled block on primary color instead of the white tile. */
    filled?: boolean;
}

const SiteDateBlock = ({ date, size = 'md', filled }: SiteDateBlockProps) => {
    const value = dayjs(date).locale('de');
    const small = size === 'sm';
    return (
        <Box
            component="time"
            dateTime={value.format('YYYY-MM-DD')}
            className={classes.dateBlock}
            w={small ? 44 : 56}
            py={small ? 6 : 8}
            bg={filled ? 'var(--site-primary)' : 'white'}
            c={filled ? 'white' : 'var(--site-primary)'}
            style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 'var(--mantine-radius-md)',
                border: filled ? undefined : '1px solid var(--site-soft-border)',
            }}
        >
            <Text fw={800} fz={small ? 17 : 22} lh={1} c="inherit">
                {value.format('D')}
            </Text>
            <Text fz={small ? 10 : 11} fw={700} tt="uppercase" lh={1.2} mt={2} lts={0.4} c="inherit">
                {value.format('MMM').replace('.', '')}
            </Text>
        </Box>
    );
};

export default SiteDateBlock;
