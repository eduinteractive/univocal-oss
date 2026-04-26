import {
    EDIModal,
    EDIMultiSelect,
    EDITextarea,
    EDITextInput,
} from '@eduinteractive/mantine-common';
import { useEffect, useState } from 'react';
import { ContactGroup } from '@eduinteractive/uvc-api';
import { Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface ContactModalSubmitData {
    contactGroupIds: string[];
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    description?: string;
    street?: string;
    zip?: string;
    city?: string;
}

interface ContactModalProps {
    visible: boolean;
    groups: ContactGroup[];
    defaultGroup?: string;
    values: ContactModalSubmitData | null;
    onClose: () => void;
    onSubmit: (data: ContactModalSubmitData) => void;
}

const ContactModal = (props: ContactModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [street, setStreet] = useState('');
    const [zip, setZip] = useState('');
    const [city, setCity] = useState('');
    const [contactGroupIds, setContactGroupIds] = useState<string[]>([]);

    useEffect(() => {
        if (props.values) {
            setTitle(props.values?.title || '');
            setFirstName(props.values?.firstName || '');
            setLastName(props.values?.lastName || '');
            setEmail(props.values?.email || '');
            setPhone(props.values?.phone || '');
            setDescription(props.values?.description || '');
        } else {
            setTitle('');
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setDescription('');
            setStreet('');
        }
        if (props.values?.contactGroupIds.length === 0 || !props.values) {
            setContactGroupIds(props.defaultGroup ? [props.defaultGroup] : []);
        } else {
            setContactGroupIds(props.values?.contactGroupIds || []);
        }
    }, [props.defaultGroup, props.values, props.visible]);

    const handleSubmit = () => {
        props.onSubmit({
            title,
            firstName,
            lastName,
            email,
            phone,
            description,
            street,
            zip,
            city,
            contactGroupIds,
        });
    };

    return (
        <EDIModal
            visible={props.visible}
            title={props.values ? t('KNOWLEDGE.CONTACT.EDIT') : t('KNOWLEDGE.CONTACT.CREATE')}
            type="DEFAULT"
            onClose={() => props.onClose()}
            onSubmit={handleSubmit}
            isForm
        >
            <EDIMultiSelect
                label={t('KNOWLEDGE.CONTACT.GROUPS')}
                placeholder={t('KNOWLEDGE.CONTACT.GROUPS')}
                value={contactGroupIds}
                onChange={(value) => setContactGroupIds(value)}
                data={props.groups.map((group) => ({
                    value: group._id,
                    label: group.title,
                }))}
            />
            <EDITextInput
                label={t('KNOWLEDGE.CONTACT.TABLE.TITLE')}
                placeholder={t('KNOWLEDGE.CONTACT.TABLE.TITLE')}
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
            />
            <EDITextInput
                label={t('KNOWLEDGE.CONTACT.TABLE.FIRST_NAME')}
                placeholder={t('KNOWLEDGE.CONTACT.TABLE.FIRST_NAME')}
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
            />
            <EDITextInput
                label={t('KNOWLEDGE.CONTACT.TABLE.LAST_NAME')}
                placeholder={t('KNOWLEDGE.CONTACT.TABLE.LAST_NAME')}
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
            />
            <EDITextInput
                label={t('KNOWLEDGE.CONTACT.TABLE.EMAIL')}
                placeholder={t('KNOWLEDGE.CONTACT.TABLE.EMAIL')}
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <EDITextInput
                label={t('COMMON.ADDRESS.PHONE')}
                placeholder={t('COMMON.ADDRESS.PHONE')}
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
            />
            <EDITextInput
                label={t('COMMON.ADDRESS.STREET')}
                placeholder={t('COMMON.ADDRESS.STREET')}
                value={street}
                onChange={(e) => setStreet(e.currentTarget.value)}
            />
            <Group py={0}>
                <EDITextInput
                    label={t('COMMON.ADDRESS.ZIP')}
                    placeholder={t('COMMON.ADDRESS.ZIP')}
                    value={zip}
                    onChange={(e) => setZip(e.currentTarget.value)}
                />
                <EDITextInput
                    label={t('COMMON.ADDRESS.CITY')}
                    placeholder={t('COMMON.ADDRESS.CITY')}
                    value={city}
                    onChange={(e) => setCity(e.currentTarget.value)}
                    style={{ flexGrow: 1 }}
                />
            </Group>
            <EDITextarea
                label={t('COMMON.ATTRIBUTES.DESCRIPTION')}
                placeholder={t('COMMON.ATTRIBUTES.DESCRIPTION_PLACEHOLDER')}
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                autosize
                minRows={3}
            />
        </EDIModal>
    );
};

export default ContactModal;
