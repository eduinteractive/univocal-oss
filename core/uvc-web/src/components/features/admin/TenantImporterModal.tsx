import {
    EDIModal,
    EDISelect,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { useCallback, useState } from 'react';
import { FileInput, Table } from '@mantine/core';
import { ParseResult, parse } from 'papaparse';
import useDomains from '../../../hooks/useDomains';
import { useTranslation } from 'react-i18next';

export interface TenantImporterModalSubmitData {
    domain?: string;
    data: { name: string }[];
}

interface TenantImporterModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: TenantImporterModalSubmitData) => void;
}

const TenantImporterModal = (props: TenantImporterModalProps) => {
    const { t } = useTranslation();
    const domains = useDomains();
    const [domain, setDomain] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<{ name: string }[]>([]);

    const handleFileChange = (file: File | null) => {
        if (file) {
            parseFile(file);
        }
    };

    const parseFile = (file: File) => {
        parse(file, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            complete: (results: ParseResult<any>) => {
                let headers: string[] = [];
                const formattedData = results.data
                    .map((row: string[], index: number) => {
                        if (index === 0) {
                            // Übernahme der Kopfzeile zur Verwendung als Schlüssel für die Objekte
                            headers = row;
                            return null; // Kopfzeile wird nicht als Datenzeile verwendet
                        }
                        const entry: { [key: string]: string } = {};
                        row.forEach((cell, idx) => {
                            const key = headers[idx] || `key${idx + 1}`; // Sicherheitsfall, sollte keine Kopfzeile vorhanden sein
                            entry[key] = cell;
                        });
                        return entry;
                    })
                    .filter(
                        (item): item is { [key: string]: string } =>
                            item !== null
                    );
                // Check if header has a name attribute
                const hasNameAttribute = Object.keys(formattedData[0]).some(
                    (header) => header === 'name'
                );
                if (!hasNameAttribute) {
                    NotificationHandler.showError(
                        t('ADMIN.ATTRIBUTES.IMPORT_ERROR_NAME')
                    );
                    return;
                }
                const filteredData = formattedData
                    .map((row) => ({
                        name: row.name,
                    }))
                    .filter((row) => row.name !== '');
                setParsedData(filteredData as { name: string }[]);
            },
        });
    };

    const renderTable = useCallback(() => {
        if (parsedData.length === 0) return null;
        const headers = Object.keys(parsedData[0]);
        return (
            <Table
                withColumnBorders
                withRowBorders
                withTableBorder
                striped
                mt="sm"
            >
                <Table.Thead>
                    <Table.Tr>
                        {headers.map((header, idx) => (
                            <Table.Th key={idx}>{header}</Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {parsedData.map((item, idx) => (
                        <Table.Tr key={idx}>
                            {Object.values(item).map((value, index) => (
                                <Table.Td key={index}>{value}</Table.Td>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        );
    }, [parsedData]);

    return (
        <EDIModal
            title={t('ADMIN.TENANT_IMPORT')}
            type="DEFAULT"
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={() => {
                if (parsedData.length === 0) {
                    return NotificationHandler.showError(
                        t('ADMIN.ATTRIBUTES.IMPORT_ERROR_CSV')
                    );
                }
                props.onSubmit({
                    domain: domain || undefined,
                    data: parsedData,
                });
            }}
        >
            <EDISelect
                label={t('ADMIN.ATTRIBUTES.DOMAIN')}
                placeholder={t('ADMIN.ATTRIBUTES.DOMAIN_PLACEHOLDER')}
                value={domain}
                onChange={(value) => setDomain(value)}
                data={domains.map((domain) => ({
                    value: domain._id,
                    label: domain.title,
                }))}
            />
            <FileInput
                placeholder={t('ADMIN.ATTRIBUTES.CSV')}
                onChange={handleFileChange}
                accept=".csv"
            />
            {parsedData.length > 0 && renderTable()}
        </EDIModal>
    );
};

export default TenantImporterModal;
