import { useEffect, useState } from 'react';
import useTenantMembers from '../../../../hooks/useTenantMembers';
import {
    EDIModal,
    EDISelect,
    EDITextInput,
} from '@eduinteractive/mantine-common';
import SVHTextEditor from '../../../common/SVHTextEditor';
import SVHDateInput from '../../../common/SVHDateInput';
import { useTranslation } from 'react-i18next';

export interface ProjektSubtaskModalSubmitData {
    _id: string;
    title: string;
    description?: string;
    dueDate?: string;
    owner?: string;
}

interface ProjektSubtaskModalProps {
    values?: ProjektSubtaskModalSubmitData;
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: ProjektSubtaskModalSubmitData) => void;
}

const ProjectSubtaskModal = (props: ProjektSubtaskModalProps) => {
    const { t } = useTranslation();
    const tenantMembers = useTenantMembers();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [owner, setOwner] = useState<string | null>(null);

    const handleSubmit = () => {
        props.onSubmit({
            _id: props.values?._id || '',
            title,
            description: description || undefined,
            dueDate: dueDate?.toString() || undefined,
            owner: owner || undefined,
        });
    };

    useEffect(() => {
        if (props.values) {
            setTitle(props.values.title);
            setDescription(props.values.description || '');
            setDueDate(
                props.values.dueDate ? new Date(props.values.dueDate) : null
            );
            setOwner(props.values.owner || null)
        } else {
            setTitle('');
            setDescription('');
            setDueDate(null);
            setOwner(null);
        }
    }, [props.values, props.visible]);

    return (
        <EDIModal
            title={props.values ? t('PROJECTS.TASKS.MODAL.SUBTASK_EDIT') : t('PROJECTS.TASKS.MODAL.SUBTASK_CREATE')}
            type="DEFAULT"
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            mih={300}
        >
            <EDITextInput
                label={t('PROJECTS.TASKS.FIELDS.TITLE')}
                placeholder={t('PROJECTS.TASKS.FIELDS.TITLE_PLACEHOLDER')}
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                required
            />
            <SVHTextEditor
                text={description}
                onChange={(text) => setDescription(text)}
            />
            <SVHDateInput
                label={t('PROJECTS.TASKS.FIELDS.DUE_DATE')}
                placeholder={t('PROJECTS.TASKS.FIELDS.DUE_DATE_PLACEHOLDER')}
                value={dueDate}
                onChange={(date) => setDueDate(date)}
            />
            <EDISelect
                label={t('PROJECTS.TASKS.FIELDS.OWNER')}
                placeholder={t('PROJECTS.TASKS.FIELDS.OWNER_PLACEHOLDER')}
                data={tenantMembers.sort((a, b) => a.firstName.localeCompare(b.firstName)).map((m) => ({
                    value: m._id,
                    label: m.firstName + ' ' + m.lastName,
                }))}
                value={owner}
                onChange={(value) => setOwner(value)}
            />
        </EDIModal>
    );
};

export default ProjectSubtaskModal;
