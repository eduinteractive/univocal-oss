import { useParams } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Contact,
    ContactGroup as IContactGroup,
    SAPI
} from '@eduinteractive/uvc-api';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import ContactsTable from '../../../components/features/tenant/knowledge/contact/ContactsTable';
import { useEffect, useState } from 'react';
import ContactModal from '../../../components/features/tenant/knowledge/contact/ContactModal';
import ContactGroupModal from '../../../components/features/tenant/knowledge/contact/ContactGroupsModal';
import ContactMultipleModal, {
    ContactMultipleModalSubmit,
} from '../../../components/features/tenant/knowledge/contact/ContactMultipleModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHFilter, {
    SVHFilterObject,
} from '../../../components/common/SVHFilter';
import { Button, FileButton } from '@mantine/core';
import { IconFileImport } from '@tabler/icons-react';
import Papa from 'papaparse';
import ContactGroupTabs from '../../../components/features/tenant/knowledge/contact/ContactGroupTabs';
import { useTranslation } from 'react-i18next';

const ContactGroup = () => {
    const { contactGroupId } = useParams();
    const { currentTenant } = useTenant();
    const [currentContactGroup, setCurrentContactGroup] = useState<{
        contactGroup: IContactGroup;
        contacts: Contact[];
    } | null>(null);
    const [currentContact, setCurrentContact] = useState<Contact | null>(null);
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [contactGroupModalVisible, setContactGroupModalVisible] =
        useState(false);
    const [contactMultipleModalVisible, setContactMultipleModalVisible] =
        useState(false);
    const [parsedContacts, setParsedContacts] = useState<
        ContactMultipleModalSubmit[]
    >([]);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);
    const { t } = useTranslation();

    const contactGroupQuery = useQuery({
        queryKey: ['contactGroup', contactGroupId, metadataFilter],
        queryFn: () =>
            SAPI.KNOWLEDGE.TENANT.getContactGroup({
                tenantId: currentTenant!._id,
                contactGroupId: contactGroupId!,
                params: metadataFilter,
            }),
    });

    const contactGroupsQuery = useQuery({
        queryKey: ['contactGroups', currentTenant?._id],
        queryFn: () =>
            SAPI.KNOWLEDGE.TENANT.getContactGroups({
                tenantId: currentTenant!._id,
                params: null,
            }),
    });

    const updateContactGroupMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.updateContactGroup,
        onSuccess: () => {
            contactGroupQuery.refetch();
            setContactGroupModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACT_GROUPS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createContactMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.createContact,
        onSuccess: () => {
            contactGroupQuery.refetch();
            setContactModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACTS.SUCCESS.CREATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateContactMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.updateContact,
        onSuccess: () => {
            contactGroupQuery.refetch();
            setContactModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACTS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteContactMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.deleteContact,
        onSuccess: () => {
            contactGroupQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACTS.SUCCESS.DELETED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createMultipleContactsMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.createMultipleContacts,
        onSuccess: () => {
            contactGroupQuery.refetch();
            setContactMultipleModalVisible(false);
            setParsedContacts([]);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACTS.SUCCESS.IMPORTED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    useEffect(() => {
        if (contactGroupQuery.data) {
            setCurrentContactGroup(contactGroupQuery.data);
        }
    }, [contactGroupQuery.data]);

    const parseCSV = (file: File): Promise<ContactMultipleModalSubmit[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse<ContactMultipleModalSubmit>(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors && results.errors.length > 0) {
                        console.warn('CSV parsing errors:', results.errors);
                    }

                    const contacts: ContactMultipleModalSubmit[] = (
                        results.data as Record<string, string>[]
                    ).map((row) => {
                        const contact: ContactMultipleModalSubmit = {};

                        // Map column headers to contact fields (case-insensitive)
                        const rowLower = Object.fromEntries(
                            Object.entries(row).map(([key, value]) => [
                                key.toLowerCase(),
                                value,
                            ])
                        );

                        if (rowLower.title || rowLower.bezeichnung)
                            contact.title =
                                rowLower.title || rowLower.bezeichnung;
                        if (rowLower.firstname || rowLower.vorname)
                            contact.firstName =
                                rowLower.firstname || rowLower.vorname;
                        if (rowLower.lastname || rowLower.nachname)
                            contact.lastName =
                                rowLower.lastname || rowLower.nachname;
                        if (rowLower.email || rowLower['e-mail'])
                            contact.email =
                                rowLower.email || rowLower['e-mail'];
                        if (rowLower.phone || rowLower.telefon)
                            contact.phone = rowLower.phone || rowLower.telefon;
                        if (rowLower.description || rowLower.beschreibung)
                            contact.description =
                                rowLower.description || rowLower.beschreibung;
                        if (rowLower.street || rowLower.straße)
                            contact.street = rowLower.street || rowLower.straße;
                        if (rowLower.zip || rowLower.plz)
                            contact.zip = rowLower.zip || rowLower.plz;
                        if (rowLower.city || rowLower.stadt)
                            contact.city = rowLower.city || rowLower.stadt;

                        return contact;
                    });

                    resolve(contacts);
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    };

    const handleFileChange = async (file: File | null) => {
        if (!file) return;

        const contacts = await parseCSV(file);
        setParsedContacts(contacts);
        setContactMultipleModalVisible(true);
    };

    return (
        <SVHPageWrapper p={0}>
            <ContactGroupTabs
                contacts={contactGroupQuery.data?.contacts || []}
                contactsTab={
                    <>
                        <SVHFilter
                            disableSort
                            value={metadataFilter || undefined}
                            onFilter={(filter) => setMetadataFilter(filter)}
                            actions={
                                <FileButton
                                    onChange={handleFileChange}
                                    accept="text/csv"
                                >
                                    {(props) => (
                                        <Button
                                            {...props}
                                            leftSection={<IconFileImport />}
                                        >
                                            {t('TENANT_PAGES.KNOWLEDGE.CONTACTS.BUTTONS.IMPORT')}
                                        </Button>
                                    )}
                                </FileButton>
                            }
                            onAdd={{
                                func: () => setContactModalVisible(true),
                                text: t('TENANT_PAGES.KNOWLEDGE.CONTACTS.BUTTONS.ADD'),
                                permission: 'knowledge',
                            }}
                        />
                        <ContactsTable
                            group={contactGroupQuery.data?.contactGroup}
                            data={currentContactGroup?.contacts || []}
                            onDelete={(contactId) =>
                                deleteContactMutation.mutate({
                                    tenantId: currentTenant!._id,
                                    contactId,
                                })
                            }
                            onEdit={(contact) => {
                                setCurrentContact(contact);
                                setContactModalVisible(true);
                            }}
                        />
                    </>
                }
                data={contactGroupQuery.data?.contactGroup || undefined}
                onEdit={() => setContactGroupModalVisible(true)}
            />
            <ContactGroupModal
                data={contactGroupQuery.data?.contactGroup}
                visible={contactGroupModalVisible}
                onClose={() => setContactGroupModalVisible(false)}
                onSubmit={(body) =>
                    updateContactGroupMutation.mutate({
                        tenantId: currentTenant!._id,
                        contactGroupId: contactGroupId!,
                        body: body,
                    })
                }
            />
            <ContactModal
                defaultGroup={contactGroupId}
                groups={contactGroupsQuery.data || []}
                visible={contactModalVisible}
                values={currentContact}
                onClose={() => setContactModalVisible(false)}
                onSubmit={(body) => {
                    if (currentContact) {
                        updateContactMutation.mutate({
                            tenantId: currentTenant!._id,
                            contactId: currentContact._id,
                            body: body,
                        });
                    } else {
                        createContactMutation.mutate({
                            tenantId: currentTenant!._id,
                            body,
                        });
                    }
                    setCurrentContact(null);
                    setContactModalVisible(false);
                }}
            />
            <ContactMultipleModal
                data={parsedContacts}
                visible={contactMultipleModalVisible}
                onClose={() => {
                    setContactMultipleModalVisible(false);
                    setParsedContacts([]);
                }}
                onSubmit={(contacts) => {
                    const contactsWithGroup = contacts.map((contact) => ({
                        ...contact,
                        contactGroupIds: [contactGroupId!],
                    }));
                    createMultipleContactsMutation.mutate({
                        tenantId: currentTenant!._id,
                        body: {
                            contacts: contactsWithGroup.map((contact) => ({
                                ...contact,
                                contactGroupIds: [contactGroupId!],
                            })),
                        },
                    });
                }}
            />
        </SVHPageWrapper>
    );
};

export default ContactGroup;
