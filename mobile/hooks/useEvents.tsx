import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../context/TenantContext';
import { useEffect, useState } from 'react';
import { getEvents, SVHEvent } from '../api/Events';

const useEvents = () => {
    const { currentTenant } = useTenant();
    const [events, setEvents] = useState<SVHEvent[]>([]);

    const eventsQuery = useQuery({
        queryKey: ['events', currentTenant?._id, {}],
        queryFn: () =>
            getEvents({ tenantId: currentTenant!._id, params: null }),
    });

    useEffect(() => {
        if (eventsQuery.data) {
            setEvents(eventsQuery.data);
        }
    }, [eventsQuery.data]);

    return events;
};

export default useEvents;
