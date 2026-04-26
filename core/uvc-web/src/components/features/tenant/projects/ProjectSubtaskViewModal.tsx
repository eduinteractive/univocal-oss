import { useMemo } from 'react';
import useTenantMembers from '../../../../hooks/useTenantMembers';
import { EDIModal } from '@eduinteractive/mantine-common';
import { Table } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ProjectSubtask } from '@eduinteractive/uvc-api';

interface ProjectSubtaskViewModalProps {
    data: ProjectSubtask;
    visible: boolean;
    onClose: () => void;
}

const ProjectSubtaskViewModal = (props: ProjectSubtaskViewModalProps) => {
    const { t } = useTranslation();
    const tenantMembers = useTenantMembers();

    const owner = useMemo(() => {
        const tenantMember = tenantMembers.find(
            (member) => member._id === props.data.owner
        );
        if (tenantMember) {
            return tenantMember.firstName + ' ' + tenantMember.lastName;
        }
        return '';
    }, [props.data, tenantMembers]);

    return (
        <EDIModal
            title={props.data.title}
            type="ALERT"
            visible={props.visible}
            onClose={props.onClose}
            mih={200}
            size="lg"
        >
            <Table mb="md">
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_TITLE')}</Table.Th>
                    <Table.Td>{props.data.title}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_DESCRIPTION')}</Table.Th>
                    <Table.Td>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: props.data.description || '',
                            }}
                        />
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_DUE_DATE')}</Table.Th>
                    <Table.Td>
                        {props.data.dueDate &&
                            new Date(props.data.dueDate).toLocaleDateString()}
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_OWNER')}</Table.Th>
                    <Table.Td>{owner}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('COMMON.STATUS')}</Table.Th>
                    <Table.Td>
                        {props.data.done ? t('COMMON.YES') : t('COMMON.NO')}
                    </Table.Td>
                </Table.Tr>
            </Table>
        </EDIModal>
    );
};

export default ProjectSubtaskViewModal;
