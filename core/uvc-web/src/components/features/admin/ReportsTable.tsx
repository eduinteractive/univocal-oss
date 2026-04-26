import { ActionIcon, Badge, Stack, Table, Text, Title } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import ReportModal from './ReportModal';
import { SVHReport, ReportStatus, ReportType } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface ReportsTableProps {
    pendingReports: SVHReport[];
    resolvedReports: SVHReport[];
    selectedReport: SVHReport | null;
    isLoadingReport: boolean;
    onSelectReport: (reportId: string) => void;
    onCloseModal: () => void;
    onUpdate: (reportId: string, action: string, reason?: string) => void;
}

const ReportsTable = (props: ReportsTableProps) => {
    const { t } = useTranslation();

    const getStatusBadge = (status: ReportStatus) => {
        if (status === ReportStatus.PENDING) {
            return <Badge color="orange">{t('ADMIN.AUDIT_PORTAL.STATUS.PENDING')}</Badge>;
        }
        return <Badge color="green">{t('ADMIN.AUDIT_PORTAL.STATUS.RESOLVED')}</Badge>;
    };

    const getTypeLabel = (type: ReportType) => {
        if (type === ReportType.PRIVATE_MESSAGE) {
            return t('ADMIN.AUDIT_PORTAL.TYPE.PRIVATE_MESSAGE');
        }
        return t('ADMIN.AUDIT_PORTAL.TYPE.GROUP_MESSAGE');
    };

    const getActionBadge = (action?: string) => {
        if (!action) return null;
        const colorMap: Record<string, string> = {
            WARNING: 'yellow',
            BAN: 'red',
            DELETE: 'orange',
            OTHER: 'gray',
        };
        return (
            <Badge color={colorMap[action] || 'gray'}>
                {t(`ADMIN.AUDIT_PORTAL.ACTION.${action}`)}
            </Badge>
        );
    };

    const renderTable = (reports: SVHReport[]) => (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{t('ADMIN.AUDIT_PORTAL.TABLE.ID')}</Table.Th>
                    <Table.Th>{t('ADMIN.AUDIT_PORTAL.TABLE.TYPE')}</Table.Th>
                    <Table.Th>{t('ADMIN.AUDIT_PORTAL.TABLE.STATUS')}</Table.Th>
                    <Table.Th>{t('ADMIN.AUDIT_PORTAL.TABLE.ACTION')}</Table.Th>
                    <Table.Th>{t('ADMIN.AUDIT_PORTAL.TABLE.CREATED')}</Table.Th>
                    <Table.Th>{t('COMMON.ACTIONS')}</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {reports.length === 0 ? (
                    <Table.Tr>
                        <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                            <Text c="dimmed" py="md">
                                {t('COMMON.DATA_EMPTY')}
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                ) : (
                    reports.map((report) => (
                        <Table.Tr key={report._id}>
                            <Table.Td>
                                <Text size="sm" ff="monospace">
                                    {report._id.substring(0, 8)}...
                                </Text>
                            </Table.Td>
                            <Table.Td>{getTypeLabel(report.type)}</Table.Td>
                            <Table.Td>{getStatusBadge(report.status)}</Table.Td>
                            <Table.Td>{getActionBadge(report.action)}</Table.Td>
                            <Table.Td>
                                {report.createdAt
                                    ? new Date(report.createdAt).toLocaleDateString('de-DE')
                                    : '-'}
                            </Table.Td>
                            <Table.Td>
                                <ActionIcon
                                    color="blue"
                                    variant="subtle"
                                    size="md"
                                    onClick={() => props.onSelectReport(report._id)}
                                >
                                    <IconEye />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))
                )}
            </Table.Tbody>
        </Table>
    );

    return (
        <>
            <ReportModal
                report={props.selectedReport}
                isLoading={props.isLoadingReport}
                visible={!!props.selectedReport}
                onClose={props.onCloseModal}
                onUpdate={(reportId, action, reason) => {
                    props.onUpdate(reportId, action, reason);
                    props.onCloseModal();
                }}
            />
            <Stack gap="xl">
                <div>
                    <Title order={5} mb="sm">
                        {t('ADMIN.AUDIT_PORTAL.PENDING_REPORTS')}
                    </Title>
                    {renderTable(props.pendingReports)}
                </div>
                <div>
                    <Title order={5} mb="sm">
                        {t('ADMIN.AUDIT_PORTAL.RESOLVED_REPORTS')}
                    </Title>
                    {renderTable(props.resolvedReports)}
                </div>
            </Stack>
        </>
    );
};

export default ReportsTable;
