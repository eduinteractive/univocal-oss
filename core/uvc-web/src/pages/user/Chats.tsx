import { Button, Group, Paper, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import classes from './Chats.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { useTranslation } from 'react-i18next';

const Chats = () => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const navigate = useNavigate();

    const chatsQuery = useQuery({
        queryKey: ['chats'],
        queryFn: SAPI.CHAT.PRIVATE.getPrivateChats,
    });

    return (
        <SVHPageWrapper p="md">
            <Group justify="space-between" align="center" mb="sm">
                <Title order={3} c="blue">
                    {t('PAGES.USER.CHATS.TITLE')}
                </Title>
                <Button size="sm"
                    onClick={() => navigate('new')}
                >{t('PAGES.USER.CHATS.NEW_CHAT_BUTTON')}</Button>
            </Group>
            {chatsQuery.data
                ?.sort(
                    (a, b) =>
                        new Date(b.creationDate).getTime() -
                        new Date(a.creationDate).getTime()
                )
                .map((chat) => (
                    <Paper
                        withBorder
                        radius={0}
                        p="md"
                        className={classes.chatCard}
                        onClick={() =>
                            navigate(
                                `/user/chat/${
                                    chat.authorId === authData?._id
                                        ? chat.recipientId
                                        : chat.authorId
                                }`
                            )
                        }
                        mah={120}
                    >
                        <Text size="sm" fw="bold">
                            {chat.authorName}
                        </Text>
                        <Text
                            size="sm"
                            c="dimmed"
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {authData?._id === chat.authorId
                                ? t('PAGES.USER.CHATS.YOU')
                                : chat.authorName}
                            : {chat.content}
                        </Text>
                        <Text size="xs" c="dimmed" ta="right" mt="sm">
                            {t('PAGES.USER.CHATS.LAST_MESSAGE')}{' '}
                            {dayjs(new Date(chat.creationDate)).format(
                                'DD/MM/YYYY HH:mm'
                            )}
                        </Text>
                    </Paper>
                ))}
            {chatsQuery.data?.length === 0 && (
                <Title order={4} ta="center" mt="md">
                    {t('PAGES.USER.CHATS.NO_CHATS')}
                </Title>
            )}
        </SVHPageWrapper>
    );
};

export default Chats;
