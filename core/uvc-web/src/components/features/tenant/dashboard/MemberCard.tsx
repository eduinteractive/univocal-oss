import {
    ActionIcon,
    Avatar,
    Card,
    Flex,
    Group,
    NavLink,
    Text,
    Title,
} from '@mantine/core';
import { TenantUser } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconChevronRight, IconMessage } from '@tabler/icons-react';
import { useAuth } from '../../../../context/AuthContext';
import { getValidAvatarIdentifier } from '../../../../utils/BannedIdentifiers';
import { useTranslation } from 'react-i18next';
import { getMemberRoleLabel } from '../../../../utils/Parser';

interface MemberCardProps {
    users: TenantUser[];
}

const MemberCard = (props: MemberCardProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const navigate = useNavigate();
    const [currentUsers, setCurrentUsers] = useState<TenantUser[]>([]);

    useEffect(() => {
        if (props.users) {
            const filteredUsers = props.users.filter((u) => u._id !== authData?._id).slice(0, 3);
            setCurrentUsers(filteredUsers);
        }
    }, [authData?._id, props.users]);

    return (
        <Card withBorder shadow="sm" flex={0.4}>
            <Card.Section p="md" pt="xs">
                <Title order={6} c="dimmed">{t('DASHBOARD.MEMBERS_TITLE')}</Title>
                {currentUsers.map((user) => {
                    return (
                        <Group justify="space-between" key={user._id}>
                            <Flex
                                direction="row"
                                align="center"
                                justify="center"
                                mt="sm"
                            >
                                <Avatar color="blue" radius="xl" size="md">
                                    {getValidAvatarIdentifier(user.firstName, user.lastName)}
                                </Avatar>
                                <Flex direction="column" ml="sm">
                                    <Text size="sm" fw="bold">
                                        {user.firstName + ' ' + user.lastName}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {
                                            getMemberRoleLabel(user.group_permission)
                                        }
                                    </Text>
                                </Flex>
                            </Flex>
                            <ActionIcon
                                variant="subtle"
                                size="md"
                                onClick={() =>
                                    navigate(`/user/chat/${user._id}`)
                                }
                            >
                                <IconMessage size={28} />
                            </ActionIcon>
                        </Group>
                    );
                })}
                <Group justify="right" mt="md">
                    <NavLink
                        variant='outline'
                        w="max-content"
                        c="blue"
                        component={Link}
                        to="/sv/members"
                        label={t('DASHBOARD.SHOW_MORE')}
                        rightSection={<IconChevronRight height={25} />}
                        style={{ paddingRight: 0}}
                    />
                </Group>
            </Card.Section>
        </Card>
    );
};

export default MemberCard;
