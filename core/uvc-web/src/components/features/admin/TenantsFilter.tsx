import { useEffect, useState } from 'react';
import { Button, Group, TextInput } from '@mantine/core';
import TenantModal, { TenantModalSubmitData } from './TenantModal';
import TenantImporterModal, {
    TenantImporterModalSubmitData,
} from './TenantImporterModal';
import useDomains from '../../../hooks/useDomains';
import { useTranslation } from 'react-i18next';

type TenantFilter = {
    text: string | null;
};

interface TenantsFilterProps {
    values: TenantFilter;
    onFilter: (filter: TenantFilter) => void;
    onAdd: (tenant: TenantModalSubmitData) => void;
    onImport: (data: TenantImporterModalSubmitData) => void;
}

const TenantsFilter = (props: TenantsFilterProps) => {
    const { t } = useTranslation();

    const domains = useDomains();
    const [textFilter, setTextFilter] = useState('');
    const [importerModalVisible, setImporterModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        setTextFilter(props.values.text ?? '');
    }, [props.values]);

    return (
        <Group justify="space-between">
            <TenantModal
                domains={domains}
                modalVisible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                }}
                onSubmit={(tenant) => {
                    setModalVisible(false);
                    props.onAdd(tenant);
                }}
            />
            <TenantImporterModal
                visible={importerModalVisible}
                onClose={() => setImporterModalVisible(false)}
                onSubmit={(data) => {
                    props.onImport(data);
                    setImporterModalVisible(false);
                }}
            />
            <Group>
                <TextInput
                    value={textFilter}
                    onChange={(event) => {
                        setTextFilter(event.currentTarget.value);
                    }}
                    placeholder={t("ADMIN.TENANT_SEARCH")}
                    size="sm"
                    mb="md"
                />
                <Button
                    onClick={() =>
                        props.onFilter({
                            text: textFilter,
                        })
                    }
                    mb="md"
                    size="sm"
                >
                    Suchen
                </Button>
            </Group>
            <Group gap="sm" mb="sm">
                <Button
                    size="sm"
                    onClick={() => {
                        setImporterModalVisible(true);
                    }}
                >
                    {t("ADMIN.TENANT_IMPORT")}
                </Button>
                <Button
                    size="sm"
                    onClick={() => {
                        setModalVisible(true);
                    }}
                >
                    {t("ADMIN.TENANT_CREATE")}
                </Button>
            </Group>
        </Group>
    );
};

export default TenantsFilter;
