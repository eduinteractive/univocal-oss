import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Groups } from '@eduinteractive/uvc-api';

interface TenantContextType {
    currentTenant: Groups | null;
    setCurrentTenant: React.Dispatch<React.SetStateAction<Groups | null>>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = (): TenantContextType => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};

export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const [currentTenant, setCurrentTenant] = useState<Groups | null>(null);

    const value = {
        currentTenant,
        setCurrentTenant,
    };

    return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};