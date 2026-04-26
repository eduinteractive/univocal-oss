import { Button, Group, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { SAPI } from "@eduinteractive/uvc-api";
import { useNavigate } from "react-router-dom";
import SVHPageWrapper from "../components/common/SVHPageWrapper";
import { useTranslation } from "react-i18next";

const Homepage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const invitationQuery = useQuery({
        queryKey: ['invitations'],
        queryFn: () => SAPI.TENANT.PRIVATE.getUserTenantInvitations(),
    })

    return (
        <SVHPageWrapper p="md">
            <Title ta="center" c="blue" order={3} mt="md">
                {t('PAGES.HOMEPAGE.WELCOME')}
            </Title>
            <Text size="sm" ta="center" fw="bold" mt="xs">
                {t('PAGES.HOMEPAGE.DESCRIPTION')}
            </Text>
            <Group justify="center" mt="sm">
                <Button variant="light" mt="sm" onClick={() => navigate('/user/invitations')}>
                    {t('PAGES.HOMEPAGE.INVITATIONS', { count: invitationQuery.data?.length || 0 })}
                </Button>
            </Group>
        </SVHPageWrapper>
    )
}

export default Homepage;