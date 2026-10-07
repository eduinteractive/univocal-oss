import { Button, Card, Group, Stack, Text, Textarea, Title } from '@mantine/core';
import { EDITextInput, NotificationHandler } from '@eduinteractive/mantine-common';
import { SVHEvent } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import SVHDateTimePicker from '../../../common/SVHDateTimePicker';
import SVHViewAccessEdit from '../../../common/SVHViewAccessEdit';
import { useTenant } from '../../../../context/TenantContext';
import { useTranslation } from 'react-i18next';

interface EventMetaSubmit {
    title?: string;
    description?: string;
    viewAccess?: number;
    startDate?: Date;
    endDate?: Date;
    place?: {
        name: string;
        address: string;
    };
}

interface EventMetaProps {
    data: SVHEvent;
    onUpdate: (data: EventMetaSubmit) => void;
}

const EventMeta = (props: EventMetaProps) => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [title, setTitle] = useState(props.data.title);
    const [description, setDescription] = useState(props.data.description || '');
    const [viewAccess, setViewAccess] = useState(props.data.viewAccess ?? currentTenant?.permissionLevel ?? 0);
    const [name, setName] = useState(props.data.place?.name ?? '');
    const [address, setAddress] = useState(props.data.place?.address ?? '');
    const [startDate, setStartDate] = useState<Date | null>(new Date(props.data.startDate));
    const [endDate, setEndDate] = useState<Date | null>(props.data.endDate ? new Date(props.data.endDate) : null);

    useEffect(() => {
        setTitle(props.data.title);
        setDescription(props.data.description || '');
        setViewAccess(props.data.viewAccess ?? currentTenant?.permissionLevel ?? 0);
        setName(props.data.place?.name ?? '');
        setAddress(props.data.place?.address ?? '');
        setStartDate(new Date(props.data.startDate));
        setEndDate(props.data.endDate ? new Date(props.data.endDate) : null);
    }, [props.data, currentTenant?.permissionLevel]);

    const savedViewAccess = props.data.viewAccess ?? currentTenant?.permissionLevel ?? 0;
    const generalDirty = title !== props.data.title
        || description !== (props.data.description || '')
        || viewAccess !== savedViewAccess;
    const sameTime = (value: Date | null, saved?: Date) => {
        if (!value && !saved) return true;
        if (!value || !saved) return false;
        return value.getTime() === new Date(saved).getTime();
    };
    const placeDirty = name !== (props.data.place?.name ?? '')
        || address !== (props.data.place?.address ?? '')
        || !sameTime(startDate, props.data.startDate)
        || !sameTime(endDate, props.data.endDate);

    const saveGeneral = () => {
        if (!title.trim()) {
            NotificationHandler.showError(t('COMMON.ATTRIBUTES.TITLE_ERROR'));
            return;
        }
        props.onUpdate({
            title: title.trim(),
            description,
            viewAccess,
        });
    };

    const savePlaceAndTime = () => {
        if (!startDate) {
            NotificationHandler.showError(t('COMMON.ATTRIBUTES.FILL_REQUIRED_FIELDS'));
            return;
        }
        if (endDate && endDate < startDate) {
            NotificationHandler.showError(t('CALENDAR.ATTRIBUTES.ENDDATE_BEFORE_STARTDATE'));
            return;
        }
        props.onUpdate({
            startDate,
            endDate: endDate || undefined,
            place: { name, address },
        });
    };

    return (
        <Stack gap="xl">
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('EVENTS.GENERAL_SETTINGS')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('EVENTS.GENERAL_SETTINGS_HINT')}
                </Text>
                <Stack gap="sm">
                    <EDITextInput
                        label={t('COMMON.ATTRIBUTES.TITLE')}
                        placeholder={t('COMMON.ATTRIBUTES.TITLE_PLACEHOLDER')}
                        value={title}
                        onChange={(event) => setTitle(event.currentTarget.value)}
                        required
                    />
                    <Textarea
                        label={t('COMMON.ATTRIBUTES.DESCRIPTION')}
                        placeholder={t('COMMON.ATTRIBUTES.DESCRIPTION_PLACEHOLDER')}
                        value={description}
                        onChange={(event) => setDescription(event.currentTarget.value)}
                        autosize
                        minRows={3}
                    />
                    <SVHViewAccessEdit
                        initial={props.data.viewAccess ?? null}
                        value={viewAccess}
                        onChange={setViewAccess}
                    />
                    <Group justify="flex-end" gap="xs">
                        <Button disabled={!generalDirty} onClick={saveGeneral}>
                            {t('SITE.SAVE')}
                        </Button>
                    </Group>
                </Stack>
            </Card>
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('EVENTS.PLACE_AND_TIME')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('EVENTS.PLACE_AND_TIME_HINT')}
                </Text>
                <Stack gap="sm">
                    <Group align="flex-end" grow>
                        <SVHDateTimePicker
                            valueFormat="DD MMM YYYY HH:mm"
                            label={t('CALENDAR.ATTRIBUTES.STARTDATE')}
                            placeholder={t('CALENDAR.ATTRIBUTES.STARTDATE_PLACEHOLDER')}
                            value={startDate}
                            onChange={setStartDate}
                            clearable
                            mt={0}
                            mb={0}
                            required
                        />
                        <SVHDateTimePicker
                            valueFormat="DD MMM YYYY HH:mm"
                            label={t('CALENDAR.ATTRIBUTES.ENDDATE')}
                            placeholder={t('CALENDAR.ATTRIBUTES.ENDDATE_PLACEHOLDER')}
                            value={endDate}
                            onChange={setEndDate}
                            clearable
                            mt={0}
                            mb={0}
                            disabled={!startDate}
                        />
                    </Group>
                    <EDITextInput
                        label={t('EVENTS.PLACE_NAME')}
                        placeholder={t('EVENTS.PLACE_NAME_PLACEHOLDER')}
                        value={name}
                        onChange={(event) => setName(event.currentTarget.value)}
                    />
                    <EDITextInput
                        label={t('EVENTS.PLACE_ADDRESS')}
                        placeholder={t('EVENTS.PLACE_ADDRESS_PLACEHOLDER')}
                        value={address}
                        onChange={(event) => setAddress(event.currentTarget.value)}
                    />
                    <Group justify="flex-end" gap="xs">
                        <Button disabled={!placeDirty} onClick={savePlaceAndTime}>
                            {t('SITE.SAVE')}
                        </Button>
                    </Group>
                </Stack>
            </Card>
        </Stack>
    );
};

export default EventMeta;
