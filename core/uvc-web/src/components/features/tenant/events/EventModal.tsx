import { NotificationHandler } from '@eduinteractive/mantine-common';
import { Group, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import SVHDateTimePicker from '../../../common/SVHDateTimePicker';
import { SVHEvent } from '@eduinteractive/uvc-api';
import { useTenant } from '../../../../context/TenantContext';
import SVHMetaModal, {
    SVHMetaModalSubmitData,
} from '../../../common/SVHMetaModal';
import { useTranslation } from 'react-i18next';

interface EventModalSubmitData extends SVHMetaModalSubmitData {
    startDate: Date;
    endDate?: Date;
    viewAccess: number;
}

interface EventModalProps {
    data?: SVHEvent;
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: EventModalSubmitData) => void;
}

const EventModal = (props: EventModalProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        if (props.data) {
            setStartDate(new Date(props.data.startDate));
            setEndDate(
                props.data.endDate ? new Date(props.data.endDate) : null
            );
        } else {
            setStartDate(null);
            setEndDate(null);
        }
    }, [props.data, currentTenant?.permissionLevel]);

    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        if (!startDate) {
            return NotificationHandler.showError(
                t('COMMON.ATTRIBUTES.FILL_REQUIRED_FIELDS')
            );
        }

        if (endDate && endDate < startDate) {
            return NotificationHandler.showError(
                t('CALENDAR.ATTRIBUTES.ENDDATE_BEFORE_STARTDATE')
            );
        }

        props.onSubmit({
            ...data,
            startDate,
            endDate: endDate || undefined,
        } as EventModalSubmitData);
    };

    return (
        <SVHMetaModal
            before={
                <Group align="center" gap="sm">
                    <SVHDateTimePicker
                        valueFormat="DD MMM YYYY HH:mm"
                        label={t('CALENDAR.ATTRIBUTES.STARTDATE')}
                        placeholder={t('CALENDAR.ATTRIBUTES.STARTDATE_PLACEHOLDER')}
                        value={startDate}
                        onChange={(value) => setStartDate(value)}
                        clearable
                        mt={0}
                        mb={0}
                        required
                    />
                    <Text>-</Text>
                    <SVHDateTimePicker
                        valueFormat="DD MMM YYYY HH:mm"
                        label={t('CALENDAR.ATTRIBUTES.ENDDATE')}
                        placeholder={t('CALENDAR.ATTRIBUTES.ENDDATE_PLACEHOLDER')}
                        value={endDate}
                        onChange={(value) => setEndDate(value)}
                        clearable
                        mb={0}
                        mt={0}
                        disabled={!startDate}
                    />
                </Group>
            }
            data={props.data || null}
            config={{ viewAccess: true }}
            title={props.data ? t('EVENTS.EDIT') : t('EVENTS.CREATE')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
        />
    );
};

export default EventModal;
