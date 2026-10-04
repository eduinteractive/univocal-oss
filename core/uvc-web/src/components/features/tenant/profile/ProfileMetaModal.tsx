import { Fieldset } from '@mantine/core';
import { useEffect, useState } from 'react';
import { EDIModal, EDITextInput } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

export interface ProfileMetaModalSubmit {
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
}

interface ProfileMetaModalProps {
    modalVisible: boolean;
    values?: ProfileMetaModalSubmit;
    onClose: () => void;
    onSubmit: (data: ProfileMetaModalSubmit) => void;
}

const ProfileMetaModal = (props: ProfileMetaModalProps) => {
    const { t } = useTranslation();
    const [contactPerson, setContactPerson] = useState<string>('');
    const [contactEmail, setContactEmail] = useState<string>('');
    const [contactPhone, setContactPhone] = useState<string>('');
    const [contactWebsite, setContactWebsite] = useState<string>('');

    useEffect(() => {
        if (props.values) {
            setContactPerson(props.values.contactPerson || '');
            setContactEmail(props.values.contactEmail || '');
            setContactPhone(props.values.contactPhone || '');
            setContactWebsite(props.values.contactWebsite || '');
        } else {
            setContactPerson('');
            setContactEmail('');
            setContactPhone('');
            setContactWebsite('');
        }
    }, [props.values])

    return (
        <EDIModal
            title={t('PROFILE.META.MODAL_TITLE')}
            type='DEFAULT'
            visible={props.modalVisible}
            onClose={props.onClose}
            onSubmit={() => {
                props.onSubmit({
                    contactPerson,
                    contactEmail,
                    contactPhone,
                    contactWebsite,
                });
            }}
            size="lg"
            isForm
        >
            <Fieldset legend={t('PROFILE.META.CONTACT_INFO')}>
                    <EDITextInput
                        label={t('PROFILE.META.CONTACT_PERSON_LABEL')}
                        placeholder={t('PROFILE.META.CONTACT_PERSON_PLACEHOLDER')}
                        value={contactPerson}
                        onChange={(event) =>
                            setContactPerson(event.currentTarget.value)
                        }
                    />
                    <EDITextInput
                        label={t('PROFILE.META.CONTACT_EMAIL_LABEL')}
                        placeholder={t('PROFILE.META.CONTACT_EMAIL_PLACEHOLDER')}
                        value={contactEmail}
                        onChange={(event) =>
                            setContactEmail(event.currentTarget.value)
                        }
                    />
                    <EDITextInput
                        label={t('PROFILE.META.CONTACT_PHONE_LABEL')}
                        placeholder={t('PROFILE.META.CONTACT_PHONE_PLACEHOLDER')}
                        value={contactPhone}
                        onChange={(event) =>
                            setContactPhone(event.currentTarget.value)
                        }
                    />
                    <EDITextInput
                        label={t('PROFILE.META.CONTACT_WEBSITE_LABEL')}
                        placeholder={t('PROFILE.META.CONTACT_WEBSITE_PLACEHOLDER')}
                        value={contactWebsite}
                        onChange={(event) =>
                            setContactWebsite(event.currentTarget.value)
                        }
                    />
                </Fieldset>
        </EDIModal>
    );
};

export default ProfileMetaModal;
