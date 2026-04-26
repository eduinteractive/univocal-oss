import { Title } from "@mantine/core";
import SVHPageWrapper from "../../components/common/SVHPageWrapper";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DomainGrid from "../../components/features/domain/DomainGrid";
import { Domain } from "@eduinteractive/uvc-api";
import { SAPI } from "@eduinteractive/uvc-api";
import { useTranslation } from 'react-i18next';

const Domains = () => {
    const { authData } = useAuth();
    const { t } = useTranslation();
    const [domains, setDomains] = useState<Domain[]>([]);

    const domainQuery = useQuery({
        queryKey: ['domains'],
        queryFn: () => SAPI.TENANT.PUBLIC.getDomains(),
    })

    useEffect(() => {
        if (domainQuery.data) {
            setDomains(domainQuery.data.filter((domain) => {
                return authData?.domains.includes(domain._id);
            }));
        }
    }, [authData?.domains, domainQuery.data])

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="sm">
                {t('DOMAIN_PAGES.DOMAINS.TITLE')}
            </Title>
            <DomainGrid data={domains} />
        </SVHPageWrapper>
    )
}

export default Domains;