import {
    Button,
    Card,
    Flex,
    Group,
    Text,
    Title,
    Avatar,
    Image,
    rem,
    Box,
    Tabs,
    ActionIcon,
} from '@mantine/core';
import {
    IconBook,
    IconBox,
    IconCamera,
    IconEdit,
    IconNews,
} from '@tabler/icons-react';
import { Profile } from '@eduinteractive/uvc-api';
import ProfileMetaModal, { ProfileMetaModalSubmit } from './ProfileMetaModal';
import React, { useEffect, useState } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import ProfileBackgroundModal, {
    ProfileBackgroundModalSubmit,
} from './ProfileBackgroundModal';
import SVHPrivacyDisclaimer from '../../../common/SVHPrivacyDisclaimer';
import LOGO from '../../../../assets/logo.png';
import { useTranslation } from 'react-i18next';

interface ProfileMetaProps {
    query?: UseQueryResult;
    profile?: Profile;
    descriptionTab: React.ReactNode;
    projectTab: React.ReactNode;
    newsTab: React.ReactNode;
    onUpdate: (data: ProfileMetaModalSubmit) => void;
    onBackgroundUpdate: (data: ProfileBackgroundModalSubmit) => void;
}

const ProfileMeta = (props: ProfileMetaProps) => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [backgroundModalVisible, setBackgroundModalVisible] = useState(false);
    const [profile, setProfile] = useState<Profile | undefined>(props.profile);

    useEffect(() => {
        setProfile(props.profile);
    }, [props.profile]);

    return (
        <>
            <div style={{ position: 'relative', width: '100%' }}>
                <ProfileBackgroundModal
                    key={props.query?.dataUpdatedAt + 'background'}
                    values={{ backgroundImage: profile?.backgroundImage }}
                    modalVisible={backgroundModalVisible}
                    onClose={() => setBackgroundModalVisible(false)}
                    onSubmit={(data) => {
                        props.onBackgroundUpdate(data);
                        setModalVisible(false);
                    }}
                />
                <Image
                    src={
                        profile?.backgroundImage
                            ? `${
                                  import.meta.env.VITE_KUBERNETES_HOST
                              }/api/profile/image/${encodeURIComponent(
                                  profile.backgroundImage as string
                              )}`
                            : "https://medienzentrum-frankfurt.de/images/easyblog_articles/1282/SV-Hub_202303_1024x768Px_72ppi.png"
                    }
                    mih={250}
                    mah={250}
                    w="100%"
                    fit="cover"
                    style={{
                        backgroundColor: profile?.backgroundImage ? undefined : 'white',
                        objectFit: profile?.backgroundImage ? undefined : 'cover',
                        overflow: profile?.backgroundImage ? undefined : 'hidden',
                    }}
                />
                <Group pos="absolute" right={10} bottom={10}>
                    <Button
                        variant="default"
                        color="gray"
                        size="xs"
                        onClick={() => setBackgroundModalVisible(true)}
                    >
                        <IconCamera style={{ marginRight: 5 }} />
                        {t('PROFILE.BACKGROUND.EDIT_BUTTON')}
                    </Button>
                </Group>
            </div>
            <Card
                flex={0.5}
                pt={0}
                bg="none"
                radius={0}
                style={{
                    overflow: 'visible',
                }}
            >
                <ProfileMetaModal
                    key={props.query?.dataUpdatedAt + 'avatar'}
                    values={profile}
                    modalVisible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSubmit={(data) => {
                        props.onUpdate(data);
                        setModalVisible(false);
                    }}
                />
                <Card.Section p="md">
                    <Group w="100%">
                        <Avatar
                            mt={-40}
                            size={rem(150)}
                            src={
                                profile?.avatarImage
                                    ? `${
                                          import.meta.env.VITE_KUBERNETES_HOST
                                      }/api/profile/image/${encodeURIComponent(
                                          profile.avatarImage as string
                                      )}`
                                    : LOGO
                            }
                            alt="Profile Picture"
                            radius="md"
                            mr="sm"
                            style={{
                                backgroundColor: profile?.avatarImage ? undefined : 'white',
                                objectFit: profile?.avatarImage ? undefined : 'contain',
                                overflow: profile?.avatarImage ? undefined : 'hidden',
                            }}
                        />
                        <Flex direction="column" wrap="wrap" flex={1}>
                            <Group justify="space-between" align="flex-start">
                                <Box>
                                    <Group gap="xs">
                                        <Title order={4}>
                                        {currentTenant?.tenant?.title}
                                        </Title>
                                        <SVHPrivacyDisclaimer />
                                    </Group>
                                    <Title order={6} c="dimmed">
                                        {t('PROFILE.META.CONTACT_PERSON')}
                                    </Title>
                                    <Text size="xs" fw="bold">
                                        {profile?.contactPerson ||
                                            t('PROFILE.META.MISSING')}
                                    </Text>
                                </Box>
                                {checkPermission(
                                    currentTenant!,
                                    'profile:update'
                                ) && (
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={() => setModalVisible(true)}
                                    >
                                        <IconEdit size={24} />
                                    </ActionIcon>
                                )}
                            </Group>
                            <Flex direction="row" gap="md" mt="md" wrap="wrap">
                                {profile?.contactEmail && (
                                    <Flex
                                        direction="column"
                                        align="start"
                                        style={{ marginRight: '20px' }}
                                    >
                                        <Title order={6} c="dimmed">
                                            {t('COMMON.CONTACT.EMAIL')}
                                        </Title>
                                        <Text size="xs" fw="bold" mb="xs">
                                            {profile.contactEmail}
                                        </Text>
                                    </Flex>
                                )}
                                {profile?.contactWebsite && (
                                    <Flex
                                        direction="column"
                                        align="start"
                                        style={{ marginRight: '20px' }}
                                    >
                                        <Title order={6} c="dimmed">
                                            {t('COMMON.ADDRESS.WEBSITE')}
                                        </Title>
                                        <Text size="xs" fw="bold" mb="xs">
                                            {profile.contactWebsite}
                                        </Text>
                                    </Flex>
                                )}
                                {profile?.contactPhone && (
                                    <Flex
                                        direction="column"
                                        align="start"
                                        style={{ marginRight: '20px' }}
                                    >
                                        <Title order={6} c="dimmed">
                                            {t('COMMON.ADDRESS.PHONE')}
                                        </Title>
                                        <Text size="xs" fw="bold" mb="xs">
                                            {profile.contactPhone}
                                        </Text>
                                    </Flex>
                                )}
                                {profile?.publicPerson && (
                                    <Flex
                                        direction="column"
                                        align="start"
                                        style={{ marginRight: '20px' }}
                                    >
                                        <Title order={6} c="dimmed">
                                            {t('PROFILE.META.PRESS_SPOKESPERSON')}
                                        </Title>
                                        <Text size="xs" fw="bold" mb="xs">
                                            {profile.publicPerson}
                                        </Text>
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                    </Group>
                </Card.Section>
                <Card.Section>
                    <Tabs defaultValue="description">
                        <Tabs.List>
                            <Tabs.Tab
                                value="description"
                                leftSection={<IconBook />}
                            >
                                {t('PROFILE.TABS.DESCRIPTION')}
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="projects"
                                leftSection={<IconBox />}
                            >
                                {t('PROFILE.TABS.PROJECTS')}
                            </Tabs.Tab>
                            <Tabs.Tab value="news" leftSection={<IconNews />}>
                                {t('PROFILE.TABS.NEWS')}
                            </Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value="description" p="md">
                            {props.descriptionTab}
                        </Tabs.Panel>
                        <Tabs.Panel value="projects" p="md">
                            {props.projectTab}
                        </Tabs.Panel>
                        <Tabs.Panel value="news" p="md">
                            {props.newsTab}
                        </Tabs.Panel>
                    </Tabs>
                </Card.Section>
            </Card>
        </>
    );
};

export default ProfileMeta;
