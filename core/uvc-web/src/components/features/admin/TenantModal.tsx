import { useEffect, useState } from 'react';
import {
    EDIModal,
    EDIMultiSelect,
    EDISelect,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { Domain, Tenant, TenantVisibility } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

export interface TenantModalSubmitData {
    title: string;
    description: string;
    domain?: string;
    visibility: TenantVisibility;
    integrations: {
        dashboard: boolean;
        documentation: boolean;
        calendar: boolean;
        survey: boolean;
        chat: boolean;
        budget: boolean;
        knowledge: boolean;
        event: boolean;
        project: boolean;
    };
}

interface TenantModalProps {
    domains?: Domain[];
    tenant?: Tenant;
    modalVisible: boolean;
    onClose: () => void;
    onSubmit: (data: TenantModalSubmitData) => void;
}

interface Integrations {
    dashboard: boolean;
    documentation: boolean;
    calendar: boolean;
    survey: boolean;
    chat: boolean;
    budget: boolean;
    knowledge: boolean;
    event: boolean;
    project: boolean;
}

const TenantModal = (props: TenantModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState(props.tenant?.title ?? '');
    const [description, setDescription] = useState(
        props.tenant?.description ?? ''
    );
    const [domain, setDomain] = useState<string | null>(
        (props.tenant?.domain as Domain)?._id ?? ''
    );
    const [visibility, setVisibility] = useState<TenantVisibility>(
        props.tenant?.visibility ?? 'HIDDEN'
    );
    const [integrations, setIntegrations] = useState<Integrations>(
        props.tenant?.integrations ?? {
            dashboard: false,
            documentation: false,
            calendar: false,
            survey: false,
            chat: false,
            budget: false,
            knowledge: false,
            event: false,
            project: false,
        }
    );

    const handleSubmit = () => {
        if (!title) {
            return NotificationHandler.showError(
                t('COMMON.ATTRIBUTES.TITLE_ERROR')
            );
        }
        props.onSubmit({
            title,
            description,
            domain: domain || undefined,
            integrations,
            visibility,
        });
    };

    useEffect(() => {
        if (props.tenant) {
            setTitle(props.tenant.title);
            setDescription(props.tenant.description ?? '');
            setDomain((props.tenant.domain as Domain)._id);
            setIntegrations(props.tenant.integrations);
            setVisibility(props.tenant.visibility);
        } else {
            setTitle('');
            setDescription('');
            setDomain('');
            setIntegrations({
                dashboard: false,
                documentation: false,
                calendar: false,
                survey: false,
                chat: false,
                budget: false,
                knowledge: false,
                event: false,
                project: false,
            });
            setVisibility('HIDDEN');
        }
    }, [props.tenant]);

    return (
        <EDIModal
            title={
                props.tenant ? t('ADMIN.TENANT_EDIT') : t('ADMIN.TENANT_CREATE')
            }
            type="DEFAULT"
            visible={props.modalVisible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            isForm
        >
            <EDITextInput
                label={t('COMMON.ATTRIBUTES.TITLE')}
                placeholder={t('COMMON.ATTRIBUTES.TITLE_PLACEHOLDER')}
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                required
            />

            <EDITextInput
                label={t('COMMON.ATTRIBUTES.DESCRIPTION')}
                placeholder={t('COMMON.ATTRIBUTES.DESCRIPTION_PLACEHOLDER')}
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
            />

            {props.domains && (
                <EDISelect
                    label={t('ADMIN.ATTRIBUTES.DOMAIN')}
                    placeholder={t('ADMIN.ATTRIBUTES.DOMAIN_PLACEHOLDER')}
                    value={domain}
                    onChange={(e) => setDomain(e)}
                    data={props.domains?.map((domain) => ({
                        label: domain.title,
                        value: domain._id,
                    }))}
                    required
                />
            )}

            <EDIMultiSelect
                label={t("ADMIN.ATTRIBUTES.INTEGRATION")}
                placeholder={t("ADMIN.ATTRIBUTES.INTEGRATION_PLACEHOLDER")}
                data={[
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.DASHBOARD"), value: 'dashboard' },
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.CALENDAR"), value: 'calendar' },
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.SURVEY"), value: 'survey' },
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.CHAT"), value: 'chat' },
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.BUDGET"), value: 'budget' },
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.KNOWLEDGE"), value: 'knowledge' },
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.EVENTS"), value: 'event' },
                    { label: t("ADMIN.ATTRIBUTES.INTEGRATIONS.PROJECTS"), value: 'project' },
                ]}
                value={Object.keys(integrations).filter(
                    (key) => integrations[key as keyof Integrations]
                )}
                onChange={(selectedValues) => {
                    // Setzen Sie alle Integrationen auf false und dann die ausgewählten auf true
                    const updatedIntegrations: Integrations = {
                        dashboard: false,
                        documentation: false,
                        calendar: false,
                        survey: false,
                        chat: false,
                        budget: false,
                        knowledge: false,
                        event: false,
                        project: false,
                    };

                    selectedValues.forEach((value) => {
                        const key = value as keyof Integrations; // Typzusicherung
                        if (key in updatedIntegrations) {
                            updatedIntegrations[key] = true;
                        }
                    });

                    setIntegrations(updatedIntegrations);
                }}
            />

            <EDISelect
                mt={10}
                label={t('ADMIN.ATTRIBUTES.GROUP_VISIBILITY')}
                value={visibility}
                onChange={(v) => {
                    if (v === 'PUBLIC' || v === 'HIDDEN' || v === 'ON_REQUEST') {
                        setVisibility(v);
                    }
                }}
                data={[
                    {
                        label: t('ADMIN.TENANT_VISIBILITY_PUBLIC'),
                        value: 'PUBLIC',
                    },
                    {
                        label: t('ADMIN.TENANT_VISIBILITY_HIDDEN'),
                        value: 'HIDDEN',
                    },
                    {
                        label: t('ADMIN.TENANT_VISIBILITY_ON_REQUEST'),
                        value: 'ON_REQUEST',
                    },
                ]}
            />
        </EDIModal>
    );
};

export default TenantModal;
