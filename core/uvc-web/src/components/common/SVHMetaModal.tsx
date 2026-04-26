import {
    EDIModal,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import React, { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import SVHTextArea from './SVHTextArea';
import SVHViewAccessEdit from './SVHViewAccessEdit';
import SVHTextEditor from './SVHTextEditor';
import { useTranslation } from 'react-i18next';

export interface SVHMetaModalSubmitData {
    title: string;
    description?: string;
    viewAccess?: number;
}

interface SVHMetaModalProps {
    before?: React.ReactNode;
    children?: React.ReactNode;
    config?: {
        viewAccess?: boolean;
        textEditor?: boolean;
    };
    data: SVHMetaModalSubmitData | null;
    title: string;
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: SVHMetaModalSubmitData) => void;
}

const SVHMetaModal = (props: SVHMetaModalProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();

    const [title, setTitle] = useState(props.data?.title || '');
    const [description, setDescription] = useState(
        props.data?.description || ''
    );
    const [viewAccess, setViewAccess] = useState<number>(
        currentTenant?.permissionLevel || 0
    );

    useEffect(() => {
        if (props.data) {
            setTitle(props.data.title);
            setDescription(props.data.description || '');
            if (props.config?.viewAccess) {
                setViewAccess(
                    props.data.viewAccess !== undefined
                        ? props.data.viewAccess
                        : currentTenant?.permissionLevel || 0
                );
            }
        } else {
            setTitle('');
            setDescription('');
            setViewAccess(currentTenant?.permissionLevel || 0);
        }
    }, [currentTenant?.permissionLevel, props.config?.viewAccess, props.data]);

    const handleSubmit = () => {
        if (!title) {
            return NotificationHandler.showError('Bitte gebe einen Titel ein.');
        }
        props.onSubmit({
            title,
            description,
            viewAccess: props.config?.viewAccess ? viewAccess : undefined,
        });
    };

    return (
        <EDIModal
            title={props.title}
            type="DEFAULT"
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            isForm
        >
            {props.before}
            <EDITextInput
                label={t("COMMON.ATTRIBUTES.TITLE")}
                placeholder={t("COMMON.ATTRIBUTES.TITLE_PLACEHOLDER")}
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                required
            />
            {!props.config?.textEditor ? (
                <SVHTextArea
                    label={t("COMMON.ATTRIBUTES.DESCRIPTION")}
                    placeholder={t("COMMON.ATTRIBUTES.DESCRIPTION_PLACEHOLDER")}
                    value={description}
                    onChange={(e) => setDescription(e.currentTarget.value)}
                    autosize
                    minRows={3}
                />
            ) : (
                <SVHTextEditor
                    text={description}
                    onChange={(text) => setDescription(text)}
                />
            )}
            {props.children}
            {props.config?.viewAccess && (
                <SVHViewAccessEdit
                    initial={props.data?.viewAccess || null}
                    value={viewAccess}
                    onChange={setViewAccess}
                />
            )}
        </EDIModal>
    );
};

export default SVHMetaModal;
