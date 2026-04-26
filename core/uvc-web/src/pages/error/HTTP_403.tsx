import { Center, Container, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface HTTP_403Props {
    title?: string;
    description?: string;
}

const HTTP_403 = (props: HTTP_403Props) => {
    const { t } = useTranslation();
    
    return (
        <Center mih="100%" p="xl">
            <Container h="100%" size="xl">
                <Title ta="center">{props.title || t('ERROR_PAGES.HTTP_403.TITLE')}</Title>
                <Text mt="md" ta="center">
                    {props.description || t('ERROR_PAGES.HTTP_403.DESCRIPTION')}
                </Text>
            </Container>
        </Center>
    );
};

export default HTTP_403;
