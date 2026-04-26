import { Group, Text } from '@mantine/core';
import { CalendarEvent } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import SVHDateTimePicker from '../../../common/SVHDateTimePicker';
import SVHMultiDropzone from '../../../common/SVHMultiDropzone';
import CalendarMaterials from './CalendarMaterials';
import { useTenant } from '../../../../context/TenantContext';
import {
    EDIColorInput,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import dayjs from 'dayjs';
import { DateValue } from '@mantine/dates';
import SVHMetaModal, {
    SVHMetaModalSubmitData,
} from '../../../common/SVHMetaModal';
import { useTranslation } from 'react-i18next';

export interface CalendarEventSubmitProps extends SVHMetaModalSubmitData {
    _id: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    color?: string;
    materials: {
        title: string;
        link: string;
        mimetype: string;
    }[];
    newUploads?: File[];
}

interface CalendarEventModalProps {
    event?: CalendarEvent;
    inferStartDate?: Date;
    visible: boolean;
    onClose: () => void;
    onSave: (event: CalendarEventSubmitProps) => void;
}

const CalendarEventModal = (props: CalendarEventModalProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [location, setLocation] = useState<string>();
    const [startDate, setStartDate] = useState<Date | null>();
    const [endDate, setEndDate] = useState<Date | null>();
    const [color, setColor] = useState<string>();
    const [materials, setMaterials] = useState<
        {
            title: string;
            link: string;
            mimetype: string;
        }[]
    >([]);
    const [newUploads, setNewUploads] = useState<File[]>([]);

    useEffect(() => {
        if (props.event) {
            setLocation(props.event.location || '');
            setStartDate(new Date(props.event.startDate));
            setEndDate(
                props.event.endDate ? new Date(props.event.endDate) : null
            );
            setColor(props.event.color || '');
            setMaterials(props.event.materials);
            setNewUploads([]);
        } else {
            if (props.inferStartDate) {
                setStartDate(props.inferStartDate);
            } else {
                setStartDate(null);
            }
            setLocation('');
            setEndDate(null);
            setColor('');
            setMaterials([]);
            setNewUploads([]);
        }
    }, [props.event, props.inferStartDate]);

    const handleEndDateChange = (value: DateValue) => {
        setEndDate(value || null);
    };

    const handleDelete = (link: string) => {
        const newMaterials = materials.filter(
            (material) => material.link !== link
        );
        setMaterials(newMaterials);
    };

    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        if (!startDate || !endDate) {
            return NotificationHandler.showError(
                t('CALENDAR.ATTRIBUTES.FILL_REQUIRED_FIELDS')
            );
        }
        if (!startDate) {
            return NotificationHandler.showError(
                t('CALENDAR.ATTRIBUTES.STARTDATE_ERROR')
            );
        }
        if (endDate && startDate > endDate) {
            return NotificationHandler.showError(
                t('CALENDAR.ATTRIBUTES.ENDDATE_BEFORE_STARTDATE')
            );
        }

        props.onSave({
            ...data,
            _id: props.event?._id || '',
            location: location,
            startDate: startDate,
            endDate: endDate ? endDate : undefined,
            materials: materials,
            color: color,
            newUploads: newUploads,
        });
    };

    return (
        <SVHMetaModal
            before={
                <Group align="center" gap="sm">
                    <SVHDateTimePicker
                        valueFormat="DD MMM YYYY HH:mm"
                        label={t('CALENDAR.ATTRIBUTES.STARTDATE')}
                        placeholder={t('CALENDAR.ATTRIBUTES.STARTDATE_PLACEHOLDER')}
                        value={startDate || null}
                        onChange={(value) => {
                            setStartDate(value || null);
                            if (
                                endDate &&
                                value &&
                                dayjs(endDate).isBefore(dayjs(value))
                            ) {
                                setEndDate(null);
                            }
                        }}
                        clearable
                        mb={0}
                        required
                    />
                    <Text mt="sm">-</Text>
                    <SVHDateTimePicker
                        valueFormat="DD MMM YYYY HH:mm"
                        label={t('CALENDAR.ATTRIBUTES.ENDDATE')}
                        placeholder={t('CALENDAR.ATTRIBUTES.ENDDATE_PLACEHOLDER')}
                        value={endDate || null}
                        onChange={handleEndDateChange}
                        clearable
                        mb={0}
                        disabled={!startDate}
                        required
                    />
                </Group>
            }
            data={props.event || null}
            title={props.event?._id ? t('CALENDAR.EVENT_EDIT') : t('CALENDAR.EVENT_NEW')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            config={{ viewAccess: true }}
        >
            <EDITextInput
                label={t('CALENDAR.ATTRIBUTES.LOCATION')}
                placeholder={t('CALENDAR.ATTRIBUTES.LOCATION_PLACEHOLDER')}
                value={location}
                onChange={(e) => setLocation(e.currentTarget.value)}
            />
            <EDIColorInput
                swatchesPerRow={8}
                swatches={[
                    '#228be6',
                    '#e64980',
                    '#be4bdb',
                    '#7950f2',
                    '#12b886',
                    '#40c057',
                    '#fab005',
                    '#fd7e14',
                ]}
                label={t('CALENDAR.ATTRIBUTES.COLOR')}
                placeholder={t('CALENDAR.ATTRIBUTES.COLOR_PLACEHOLDER')}
                disallowInput
                withPicker={false}
                withEyeDropper={false}
                value={color}
                onChange={(color) => setColor(color)}
                leftSectionPointerEvents='none'
            />
            <CalendarMaterials
                materials={materials}
                onDownload={(link) => {
                    window.open(
                        `${
                            import.meta.env.VITE_KUBERNETES_HOST
                        }/api/calendar/tenant/${currentTenant?._id}/event/${props
                            .event?._id}/download/${encodeURIComponent(link)}`,
                        '_blank'
                    );
                }}
                onDelete={handleDelete}
            />
            <SVHMultiDropzone
                value={[]}
                onSelected={setNewUploads}
                onRemove={() => setNewUploads([])}
            />
        </SVHMetaModal>
    );
};

export default CalendarEventModal;
