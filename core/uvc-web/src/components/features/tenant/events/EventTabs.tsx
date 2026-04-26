import { Tabs } from "@mantine/core";
import { IconCheck, IconClipboard, IconFileDescription, IconRegistered } from "@tabler/icons-react";
import React from "react";
import SVHTabs from "../../../common/SVHTabs";
import { useTranslation } from "react-i18next";

interface EventTabsProps {
    generalTab: React.ReactNode;
    tocTab: React.ReactNode;
    registrationTab: React.ReactNode;
    accreditationTab: React.ReactNode;
    title?: string;
}

const EventTabs = (props: EventTabsProps) => {
    const { t } = useTranslation();
    return (
        <SVHTabs defaultValue="general" title={props.title}>
            <Tabs.List>
                <Tabs.Tab value="general" leftSection={<IconFileDescription />}>
                    {t('EVENTS.GENERAL')}
                </Tabs.Tab>
                <Tabs.Tab value="registrations" leftSection={<IconRegistered />}>
                    {t('EVENTS.REGISTRATIONS')}
                </Tabs.Tab>
                <Tabs.Tab value="toc" leftSection={<IconClipboard />}>
                    {t('EVENTS.TOC')}
                </Tabs.Tab>
                <Tabs.Tab value="accreditations" leftSection={<IconCheck />}>
                    {t('EVENTS.ACCREDITATIONS')}
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="general" p="md">
                {props.generalTab}
            </Tabs.Panel>
            <Tabs.Panel value="registrations" p="md">
                {props.registrationTab}
            </Tabs.Panel>
            <Tabs.Panel value="toc" p="md">
                {props.tocTab}
            </Tabs.Panel>
            <Tabs.Panel value="accreditations" p="md">
                {props.accreditationTab}
            </Tabs.Panel>
        </SVHTabs>
    )
}

export default EventTabs;