import { useEffect, useState } from 'react';
import { EDIModal, EDITextInput } from '@eduinteractive/mantine-common';
import { Domain } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface DomainModalProps {
    domain: Domain | null;
    modalVisible: boolean;
    onClose: () => void;
    onSave: (domain: Domain) => void;
}

const DomainModal = (props: DomainModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState(props.domain?.title || '');
    const [shortcode, setShortcode] = useState(props.domain?.shortcode || '');
    const [idpIdentifier, setIdpIdentifier] = useState(props.domain?.idpIdentifier || '');

    useEffect(() => {
        setTitle(props.domain?.title || '');
        setShortcode(props.domain?.shortcode || '');
        setIdpIdentifier(props.domain?.idpIdentifier || '');
    }, [props.domain]);

    return (
        <EDIModal
            title={
                props.domain
                    ? t('ADMIN.DOMAIN_EDIT_TITLE')
                    : t('ADMIN.DOMAIN_CREATE_TITLE')
            }
            visible={props.modalVisible}
            onClose={props.onClose}
            onSubmit={() =>
                props.onSave({
                    _id: props.domain ? props.domain._id : '',
                    title,
                    shortcode,
                    idpIdentifier,
                })
            }
            isForm
        >
            <EDITextInput
                label={t('COMMON.ATTRIBUTES.TITLE')}
                placeholder={t('COMMON.ATTRIBUTES.TITLE_PLACEHOLDER')}
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
            />
            <EDITextInput
                label={t('ADMIN.ATTRIBUTES.SHORTCODE')}
                placeholder={t('ADMIN.ATTRIBUTES.SHORTCODE_PLACEHOLDER')}
                value={shortcode}
                onChange={(e) => setShortcode(e.currentTarget.value)}
            />
            <EDITextInput
                label={t('ADMIN.ATTRIBUTES.IDP_IDENTIFIER')}
                placeholder={t('ADMIN.ATTRIBUTES.IDP_IDENTIFIER_PLACEHOLDER')}
                value={idpIdentifier}
                onChange={(e) => setIdpIdentifier(e.currentTarget.value)}
            />
        </EDIModal>
    );
};

export default DomainModal;
