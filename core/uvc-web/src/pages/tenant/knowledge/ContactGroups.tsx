import { useMutation, useQuery } from '@tanstack/react-query';
import { useTenant } from '../../../context/TenantContext';
import {
    ContactGroup,
    SAPI,
} from '@eduinteractive/uvc-api';
import { useState } from 'react';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import ContactGroupModal from '../../../components/features/tenant/knowledge/contact/ContactGroupsModal';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import { useNavigate } from 'react-router-dom';
import SVHFilter, {
    SVHFilterObject,
} from '../../../components/common/SVHFilter';
import { useTranslation } from 'react-i18next';

const ContactGroups = () => {
    const { currentTenant } = useTenant();
    const navigate = useNavigate();
    const [contactGroupModalVisible, setContactGroupModalVisible] =
        useState(false);
    const [currentContactGroup, setCurrentContactGroup] =
        useState<ContactGroup | null>(null);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);
    const { t } = useTranslation();

    const contactGroupsQuery = useQuery({
        queryKey: ['contactGroups', currentTenant?._id, metadataFilter],
        queryFn: () =>
            SAPI.KNOWLEDGE.TENANT.getContactGroups({
                tenantId: currentTenant!._id,
                params: metadataFilter,
            }),
    });

    const createContactGroupMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.createContactGroup,
        onSuccess: () => {
            contactGroupsQuery.refetch();
            setCurrentContactGroup(null);
            setContactGroupModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACT_GROUPS.SUCCESS.CREATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateContactGroupMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.updateContactGroup,
        onSuccess: () => {
            contactGroupsQuery.refetch();
            setCurrentContactGroup(null);
            setContactGroupModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACT_GROUPS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteContactGroupMutation = useMutation({
        mutationFn: SAPI.KNOWLEDGE.TENANT.deleteContactGroup,
        onSuccess: () => {
            contactGroupsQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.KNOWLEDGE.CONTACT_GROUPS.SUCCESS.DELETED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <>
            <SVHFilter
                value={metadataFilter || undefined}
                onFilter={(filter) => setMetadataFilter(filter)}
                onAdd={{
                    func: () => setContactGroupModalVisible(true),
                    text: t('TENANT_PAGES.KNOWLEDGE.CONTACT_GROUPS.ADD'),
                    permission: 'knowledge',
                }}
            />
            <ContactGroupModal
                data={currentContactGroup || undefined}
                visible={contactGroupModalVisible}
                onClose={() => {
                    setCurrentContactGroup(null);
                    setContactGroupModalVisible(false);
                }}
                onSubmit={(body) => {
                    if (currentContactGroup) {
                        updateContactGroupMutation.mutate({
                            tenantId: currentTenant!._id,
                            contactGroupId: currentContactGroup._id,
                            body,
                        });
                    } else {
                        createContactGroupMutation.mutate({
                            tenantId: currentTenant!._id,
                            body,
                        });
                    }
                }}
            />
            <SVHMetaGrid
                permissionPrefix="knowledge"
                data={contactGroupsQuery.data || []}
                onEdit={(data) => {
                    setCurrentContactGroup(data as ContactGroup);
                    setContactGroupModalVisible(true);
                }}
                onDelete={(contactGroupId) => {
                    deleteContactGroupMutation.mutate({
                        tenantId: currentTenant!._id,
                        contactGroupId,
                    });
                }}
                onOpen={(item) =>
                    navigate(`contactgroup/${(item as ContactGroup)._id}`)
                }
            />
        </>
    );
};

export default ContactGroups;
