import { useQuery } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { eventEmitter, useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { SAPI } from '@eduinteractive/uvc-api';
import SVHLoader from '../components/common/SVHLoader';
import Authentification from '../pages/Authentification';

const RequireLogin = () => {
    const { authData, setAuthData } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthQuery = useQuery({
        queryKey: ['authData'],
        queryFn: SAPI.AUTH.PUBLIC.checkAuth,
        retry: false,
        throwOnError: false
    });

    useEffect(() => {
        if (checkAuthQuery.data) {
            setAuthData(checkAuthQuery.data);
            setIsLoading(false);
        }
    }, [checkAuthQuery.data, setAuthData]);

    useEffect(() => {
        eventEmitter.on('unauthorized', checkAuthQuery.refetch);
        eventEmitter.on('refreshAuth', checkAuthQuery.refetch);

        return () => {
            eventEmitter.off('unauthorized', checkAuthQuery.refetch);
            eventEmitter.off('refreshAuth', checkAuthQuery.refetch);
        };
    }, [checkAuthQuery.refetch]);

    useEffect(() => {
        if (checkAuthQuery.isError) {
            setAuthData(null);
            setIsLoading(false);
        }
    }, [checkAuthQuery.error, checkAuthQuery.isError, setAuthData]);

    if (isLoading) {
        return <SVHLoader />
    }

    if (!authData) {
        return <Authentification />;
    }

    return <Outlet />;
};

export default RequireLogin;
