import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { EDISelect, EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';
import SVHTextArea from '../../common/SVHTextArea';

type IssueType = 'FEATURE_REQUEST' | 'BUG_REPORT' | 'OTHER';

interface BugModalProps {
    visible: boolean;
    onClose: () => void;
    tenantId?: string;
}

const BugModal = (props: BugModalProps) => {
    const { t } = useTranslation();
    const [type, setType] = useState<IssueType | null>('BUG_REPORT');
    const [description, setDescription] = useState('');

    const reportIssueMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.reportTenantIssue,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('TENANT.ISSUE.SUCCESS'));
            props.onClose();
        },
        onError: NotificationHandler.showAxiosError,
    });

    useEffect(() => {
        if (!props.visible) {
            setType('BUG_REPORT');
            setDescription('');
        }
    }, [props.visible]);

    const handleSubmit = () => {
        if (!type) {
            return;
        }
        if (!description.trim()) {
            return NotificationHandler.showError(
                t('TENANT.ERRORS.DESCRIPTION_REQUIRED')
            );
        }

        reportIssueMutation.mutate({
            tenantId: props.tenantId ?? '',
            body: {
                type,
                description: description.trim(),
                url: window.location.href,
            },
        });
    };

    return (
        <EDIModal
            type="DEFAULT"
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            title={t('TENANT.ISSUE.MODAL_TITLE')}
            size="lg"
            loading={reportIssueMutation.isPending}
        >
            <EDISelect
                label={t('TENANT.ISSUE.TYPE_LABEL')}
                placeholder={t('TENANT.ISSUE.TYPE_PLACEHOLDER')}
                data={[
                    {
                        value: 'BUG_REPORT',
                        label: t('TENANT.ISSUE.TYPE_BUG_REPORT'),
                    },
                    {
                        value: 'FEATURE_REQUEST',
                        label: t('TENANT.ISSUE.TYPE_FEATURE_REQUEST'),
                    },
                    {
                        value: 'OTHER',
                        label: t('TENANT.ISSUE.TYPE_OTHER'),
                    },
                ]}
                value={type ?? ''}
                onChange={(value) => setType((value as IssueType) || null)}
                mb="md"
            />
            <SVHTextArea
                value={description}
                label={t('TENANT.ISSUE.DESCRIPTION_LABEL')}
                onChange={(e) => setDescription(e.currentTarget.value)}
                placeholder={t('TENANT.ISSUE.DESCRIPTION_PLACEHOLDER')}
                minRows={4}
                autosize
            />
        </EDIModal>
    );
};

export default BugModal;
