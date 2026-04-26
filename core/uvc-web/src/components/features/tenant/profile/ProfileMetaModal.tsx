import { Fieldset, Flex } from '@mantine/core';
import { useEffect, useState } from 'react';
import SVHCropDropzone from '../../../common/SVHCropDropzone';
import { EDIModal, EDITextInput } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

export interface ProfileMetaModalSubmit {
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWebsite?: string;
    publicPerson?: string;
    avatarImage?: File | string | null;
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
    const [publicPerson, setPublicPerson] = useState<string>('');
    const [avatarImage, setAvatarImage] = useState<File | string | null>(null);

    useEffect(() => {
        if (props.values) {
            setContactPerson(props.values.contactPerson || '');
            setContactEmail(props.values.contactEmail || '');
            setContactPhone(props.values.contactPhone || '');
            setContactWebsite(props.values.contactWebsite || '');
            setPublicPerson(props.values.publicPerson || '');
            setAvatarImage(props.values.avatarImage || null);
        } else {
            setContactPerson('');
            setContactEmail('');
            setContactPhone('');
            setContactWebsite('');
            setPublicPerson('');
            setAvatarImage(null);
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
                    publicPerson,
                    avatarImage,
                });
            }}
            size="lg"
            isForm
        >
            <Flex direction="row" gap="sm">
                <Fieldset legend={t('PROFILE.META.CONTACT_INFO')} w="60%">
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
                <Fieldset legend={t('PROFILE.META.AVATAR')} p="sm" w="40%">
                    <SVHCropDropzone
                        bordered
                        value={avatarImage}
                        onSelected={setAvatarImage}
                        onRemove={() => setAvatarImage(null)}
                    />
                </Fieldset>
            </Flex>
            <Fieldset legend={t('PROFILE.META.MORE_INFO')} mt="sm">
                <EDITextInput
                    label={t('PROFILE.META.PRESS_SPOKESPERSON')}
                    placeholder={t('PROFILE.META.PRESS_SPOKESPERSON')}
                    value={publicPerson}
                    onChange={(event) =>
                        setPublicPerson(event.currentTarget.value)
                    }
                />
            </Fieldset>
        </EDIModal>
    );
};

export default ProfileMetaModal;
