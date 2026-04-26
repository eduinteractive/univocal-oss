import { Tabs } from '@mantine/core';
import {
    IconChecklist,
    IconFileDescription,
} from '@tabler/icons-react';
import React from 'react';
import SVHTabs from '../../../common/SVHTabs';
import { useTranslation } from 'react-i18next';

interface ProjectTabsProps {
    generalTab: React.ReactNode;
    tasksTab: React.ReactNode;
    title?: string;
}

const ProjectTabs = (props: ProjectTabsProps) => {
    const { t } = useTranslation();
    return (
        <SVHTabs defaultValue="tasks" title={props.title}>
            <Tabs.List>
                <Tabs.Tab value="tasks" leftSection={<IconChecklist />}>
                    {t('PROJECTS.TABS.TASKS')}
                </Tabs.Tab>
                <Tabs.Tab value="general" leftSection={<IconFileDescription />}>
                    {t('PROJECTS.TABS.DESCRIPTION')}
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="general" p="md">
                {props.generalTab}
            </Tabs.Panel>
            <Tabs.Panel value="tasks" p="md">
                {props.tasksTab}
            </Tabs.Panel>
        </SVHTabs>
    );
};

export default ProjectTabs;
