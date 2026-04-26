import { Group, Text, Title } from '@mantine/core';
import {
    CalendarEvent,
    SAPI,
} from '@eduinteractive/uvc-api';
import { useState } from 'react';
import CalendarEventModal from '../../components/features/tenant/calendar/CalendarEventModal';
import CalendarFilter from '../../components/features/tenant/calendar/CalendarFilter';
import { useTenant } from '../../context/TenantContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import CalendarRaster from '../../components/features/tenant/calendar/CalendarRaster';
import CalendarTable from '../../components/features/tenant/calendar/CalendarTable';
import { SVHFilterObject } from '../../components/common/SVHFilter';
import SVHPrivacyDisclaimer from '../../components/common/SVHPrivacyDisclaimer';
import { useTranslation } from 'react-i18next';

const Calendar = () => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(
        null
    );
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);

    const calendarEventsQuery = useQuery({
        queryKey: ['calendarEvents', currentTenant?._id, metadataFilter],
        queryFn: () =>
            SAPI.CALENDAR.TENANT.getCalendarEvents({
                tenantId: currentTenant!._id,
                params: metadataFilter,
            }),
    });

    const calendarTokenQuery = useQuery({
        queryKey: ['calendarToken', currentTenant?._id],
        queryFn: () => SAPI.CALENDAR.TENANT.getCalendarToken(currentTenant!._id),
    });

    const calendarUpdateMutation = useMutation({
        mutationFn: SAPI.CALENDAR.TENANT.updateCalendarEvent,
        onSuccess: () => {
            calendarEventsQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.CALENDAR.SUCCESS.SAVED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const calendarDeleteMutation = useMutation({
        mutationFn: SAPI.CALENDAR.TENANT.deleteCalendarEvent,
        onSuccess: () => {
            calendarEventsQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.CALENDAR.SUCCESS.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const calendarCreateMutation = useMutation({
        mutationFn: SAPI.CALENDAR.TENANT.createCalendarEvent,
        onSuccess: () => {
            calendarEventsQuery.refetch();
            setEventModalVisible(false);
            NotificationHandler.showSuccess(t('TENANT_PAGES.CALENDAR.SUCCESS.CREATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const handlePrevMonth = () => {
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleNextMonth = () => {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    return (
        <SVHPageWrapper p="md">
            <Group gap="xs">
                <Title order={3} c="blue">
                    {t('TENANT_PAGES.CALENDAR.TITLE')}
                </Title>
                <SVHPrivacyDisclaimer />
            </Group>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.CALENDAR.DESCRIPTION')}
            </Text>
            <CalendarFilter
                calenderToken={calendarTokenQuery.data}
                filter={metadataFilter || undefined}
                month={currentMonth}
                year={currentYear}
                onAdd={() => {
                    setEventModalVisible(true);
                }}
                onFilter={(filter) => setMetadataFilter(filter)}
                onNextMonth={handleNextMonth}
                onPreviousMonth={handlePrevMonth}
            />
            <CalendarEventModal
                event={currentEvent || undefined}
                visible={eventModalVisible}
                onClose={() => {
                    setEventModalVisible(false);
                }}
                onSave={(data) => {
                    calendarCreateMutation.mutate({
                        tenantId: currentTenant!._id,
                        title: data.title,
                        description: data.description,
                        location: data.location,
                        startDate: data.startDate,
                        endDate: data.endDate as Date,
                        color: data.color,
                        viewAccess: data.viewAccess!,
                        materials: data.materials,
                        newUploads: data.newUploads,
                    });
                }}
            />
            {!metadataFilter?.text && (
                <CalendarRaster
                    month={currentMonth}
                    year={currentYear}
                    events={calendarEventsQuery.data || []}
                    onSave={(data) => {
                        if (!data._id) {
                            calendarCreateMutation.mutate({
                                tenantId: currentTenant!._id,
                                title: data.title,
                                description: data.description,
                                location: data.location,
                                startDate: data.startDate,
                                endDate: data.endDate as Date,
                                materials: data.materials,
                                color: data.color,
                                viewAccess: data.viewAccess!,
                                newUploads: data.newUploads,
                            });
                        } else {
                            calendarUpdateMutation.mutate({
                                eventId: data._id,
                                tenantId: currentTenant!._id,
                                body: {
                                    title: data.title,
                                    description: data.description,
                                    location: data.location,
                                    startDate: data.startDate,
                                    endDate: data.endDate,
                                    color: data.color,
                                    viewAccess: data.viewAccess!,
                                    materials: data.materials,
                                    newUploads: data.newUploads,
                                },
                            });
                        }
                    }}
                    onDelete={(eventId) => {
                        calendarDeleteMutation.mutate({
                            eventId,
                            tenantId: currentTenant!._id,
                        });
                    }}
                />
            )}
            {metadataFilter?.text && (
                <CalendarTable
                    events={calendarEventsQuery.data || []}
                    onEdit={(event) => {
                        setEventModalVisible(true);
                        setCurrentEvent(event);
                    }}
                    onDelete={(eventId) => {
                        calendarDeleteMutation.mutate({
                            eventId,
                            tenantId: currentTenant!._id,
                        });
                    }}
                />
            )}
        </SVHPageWrapper>
    );
};

export default Calendar;
