import { useEffect, useState } from 'react';
import { EDIModal, EDITextarea } from '@eduinteractive/mantine-common';
import { SVHReport, ReportAction, ReportType } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';
import { Select, Text, Badge, Stack, Divider } from '@mantine/core';
import SVHLoader from '../../../components/common/SVHLoader';

interface ReportModalProps {
    report: SVHReport | null;
    isLoading?: boolean;
    visible: boolean;
    onClose: () => void;
    onUpdate: (reportId: string, action: string, reason?: string) => void;
}

const ReportModal = (props: ReportModalProps) => {
    const { t } = useTranslation();
    const [action, setAction] = useState<string>('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (props.report) {
            setAction(props.report.action || '');
            setReason(props.report.reason || '');
        } else {
            setAction('');
            setReason('');
        }
    }, [props.report]);

    const handleSubmit = () => {
        if (!props.report || !action) {
            return;
        }
        props.onUpdate(props.report._id, action, reason || undefined);
    };

    const getTypeLabel = (type?: ReportType) => {
        if (!type) return '-';
        if (type === ReportType.PRIVATE_MESSAGE) {
            return t('ADMIN.AUDIT_PORTAL.TYPE.PRIVATE_MESSAGE');
        }
        return t('ADMIN.AUDIT_PORTAL.TYPE.GROUP_MESSAGE');
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return null;
        if (status === 'PENDING') {
            return (
                <Badge color="orange">
                    {t('ADMIN.AUDIT_PORTAL.STATUS.PENDING')}
                </Badge>
            );
        }
        return (
            <Badge color="green">
                {t('ADMIN.AUDIT_PORTAL.STATUS.RESOLVED')}
            </Badge>
        );
    };

    if (props.isLoading) {
        return (
            <EDIModal
                title={t('ADMIN.AUDIT_PORTAL.MODAL.TITLE')}
                visible={props.visible}
                onClose={props.onClose}
                isForm={false}
            >
                <SVHLoader />
            </EDIModal>
        );
    }

    return (
        <EDIModal
            title={t('ADMIN.AUDIT_PORTAL.MODAL.TITLE')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            isForm
            size="lg"
        >
            {props.report && (
                <Stack gap="md">
                    <div>
                        <Text size="sm" c="dimmed" mb={4}>
                            {t('ADMIN.AUDIT_PORTAL.MODAL.REPORT_ID')}
                        </Text>
                        <Text size="sm" ff="monospace">
                            {props.report._id}
                        </Text>
                    </div>

                    <div>
                        <Text size="sm" c="dimmed" mb={4}>
                            {t('ADMIN.AUDIT_PORTAL.MODAL.MESSAGE_ID')}
                        </Text>
                        <Text size="sm" ff="monospace">
                            {props.report.messageId}
                        </Text>
                    </div>

                    <div>
                        <Text size="sm" c="dimmed" mb={4}>
                            {t('ADMIN.AUDIT_PORTAL.TABLE.TYPE')}
                        </Text>
                        <Text size="sm">{getTypeLabel(props.report.type)}</Text>
                    </div>

                    <div>
                        <Text size="sm" c="dimmed" mb={4}>
                            {t('ADMIN.AUDIT_PORTAL.TABLE.STATUS')}
                        </Text>
                        {getStatusBadge(props.report.status)}
                    </div>

                    {props.report.originalMessageContent && (
                        <>
                            <Divider />
                            <div>
                                <Text size="sm" c="dimmed" mb={4}>
                                    {t(
                                        'ADMIN.AUDIT_PORTAL.MODAL.ORIGINAL_MESSAGE_CONTENT'
                                    )}
                                </Text>
                                <Text
                                    size="sm"
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {props.report.originalMessageContent}
                                </Text>
                            </div>
                        </>
                    )}

                    {props.report.message &&
                        !props.report.originalMessageContent && (
                            <>
                                <Divider />
                                <div>
                                    <Text size="sm" c="dimmed" mb={4}>
                                        {t(
                                            'ADMIN.AUDIT_PORTAL.MODAL.MESSAGE_CONTENT'
                                        )}
                                    </Text>
                                    <Text
                                        size="sm"
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {props.report.message}
                                    </Text>
                                </div>
                                <Divider />
                            </>
                        )}

                    {props.report.action && (
                        <div>
                            <Text size="sm" c="dimmed" mb={4}>
                                {t('ADMIN.AUDIT_PORTAL.MODAL.CURRENT_ACTION')}
                            </Text>
                            <Badge color="blue">
                                {t(
                                    `ADMIN.AUDIT_PORTAL.ACTION.${props.report.action}`
                                )}
                            </Badge>
                        </div>
                    )}

                    {props.report.reason && (
                        <div>
                            <Text size="sm" c="dimmed" mb={4}>
                                {t('ADMIN.AUDIT_PORTAL.MODAL.CURRENT_REASON')}
                            </Text>
                            <Text size="sm">{props.report.reason}</Text>
                        </div>
                    )}

                    <Divider />

                    <Select
                        label={t('ADMIN.AUDIT_PORTAL.MODAL.ACTION_LABEL')}
                        placeholder={t(
                            'ADMIN.AUDIT_PORTAL.MODAL.ACTION_PLACEHOLDER'
                        )}
                        value={action}
                        onChange={(value) => setAction(value || '')}
                        data={[
                            {
                                value: ReportAction.WARNING,
                                label: t('ADMIN.AUDIT_PORTAL.ACTION.WARNING'),
                            },
                            {
                                value: ReportAction.BAN,
                                label: t('ADMIN.AUDIT_PORTAL.ACTION.BAN'),
                            },
                            {
                                value: ReportAction.DELETE,
                                label: t('ADMIN.AUDIT_PORTAL.ACTION.DELETE'),
                            },
                            {
                                value: ReportAction.OTHER,
                                label: t('ADMIN.AUDIT_PORTAL.ACTION.OTHER'),
                            },
                        ]}
                        required
                    />

                    <EDITextarea
                        label={t('ADMIN.AUDIT_PORTAL.MODAL.REASON_LABEL')}
                        placeholder={t(
                            'ADMIN.AUDIT_PORTAL.MODAL.REASON_PLACEHOLDER'
                        )}
                        value={reason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setReason(e.currentTarget.value)
                        }
                        autosize
                        minRows={3}
                    />
                </Stack>
            )}
        </EDIModal>
    );
};

export default ReportModal;
