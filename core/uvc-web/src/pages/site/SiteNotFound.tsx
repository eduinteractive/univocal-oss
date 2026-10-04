import { Button, Center, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconWorldOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface SiteNotFoundProps {
    homePath?: string;
    title?: string;
}

const SiteNotFound = ({ homePath, title }: SiteNotFoundProps) => {
    const { t } = useTranslation();
    return (
        <Center mih="60vh" p="xl">
            <Stack align="center" gap="sm" maw={420}>
                <ThemeIcon size={64} radius="xl" variant="light" color="var(--site-primary)">
                    <IconWorldOff size={34} />
                </ThemeIcon>
                <Title order={3} c="var(--site-primary)" ta="center">
                    {title ?? t('SITE.PUBLIC.NOT_FOUND_TITLE')}
                </Title>
                <Text c="dimmed" ta="center">
                    {t('SITE.PUBLIC.NOT_FOUND_DESCRIPTION')}
                </Text>
                {homePath !== undefined && (
                    <Button component={Link} to={homePath || '/'} color="var(--site-primary)" radius="xl">
                        {t('SITE.PUBLIC.BACK_HOME')}
                    </Button>
                )}
            </Stack>
        </Center>
    );
};

export default SiteNotFound;
