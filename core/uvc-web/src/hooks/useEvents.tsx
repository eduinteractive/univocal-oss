import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../context/TenantContext';
import { useEffect, useState } from 'react';
import { SVHEvent, SAPI } from '@eduinteractive/uvc-api';

const useEvents = () => {
    const { currentTenant } = useTenant();
    const [events, setEvents] = useState<SVHEvent[]>([]);

    const eventsQuery = useQuery({
        queryKey: ['events', currentTenant?._id],
        queryFn: () =>
            SAPI.EVENT.TENANT.getEvents({ tenantId: currentTenant!._id, params: null }),
    });

    useEffect(() => {
        if (eventsQuery.data) {
            setEvents(eventsQuery.data);
        }
    }, [eventsQuery.data]);

    return events;
};

export default useEvents;
