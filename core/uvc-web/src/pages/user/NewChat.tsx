import { ActionIcon, Avatar, Group, Paper, Text, Title } from '@mantine/core';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { useNavigate } from 'react-router-dom';
import { IconMessage } from '@tabler/icons-react';
import { getValidAvatarIdentifier } from '../../utils/BannedIdentifiers';
import classes from './Chats.module.css';
import { useTranslation } from 'react-i18next';

const NewChat = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const usersQuery = useQuery({
        queryKey: ['usersInSameGroup'],
        queryFn: () => SAPI.AUTH.PRIVATE.getUsersInSameGroups(),
    });

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="xs">
                {t('PAGES.USER.NEW_CHAT.TITLE')}
            </Title>
            {usersQuery.data?.map((user) => (
                <Paper
                    withBorder
                    p="xs"
                    style={{ borderRadius: 0 }}
                    className={classes.chatCard}
                    onClick={() => navigate(`/user/chat/${user._id}`)}
                    key={user._id}
                >
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                            <Avatar size={34} radius="xl" bg="blue">
                                <Text size="xs" ta="center" c="white" mt={3}>
                                    {getValidAvatarIdentifier(
                                        user.firstName,
                                        user.lastName
                                    )}
                                </Text>
                            </Avatar>
                            <Text size="sm">
                                {user.firstName + ' ' + user.lastName}
                            </Text>
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                            <ActionIcon
                                variant="subtle"
                                onClick={() =>
                                    navigate(`/user/chat/${user._id}`)
                                }
                            >
                                <IconMessage size={24} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Paper>
            ))}
            {usersQuery.data?.length === 0 && (
                <Title order={4} ta="center" mt="md">
                    {t('PAGES.USER.NEW_CHAT.NO_MEMBERS')}
                </Title>
            )}
        </SVHPageWrapper>
    );
};

export default NewChat;
