import React, { ReactNode, createContext, useContext, useState } from 'react';
import { AuthData } from '@eduinteractive/uvc-api';
import { APIHandler } from '@eduinteractive/uvc-api';
import EventEmitter from 'eventemitter3';

export const eventEmitter = new EventEmitter();

APIHandler.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            eventEmitter.emit('unauthorized');
        }
        return Promise.reject(error);
    }
);

interface AuthContextType {
    authData: AuthData | null;
    setAuthData: React.Dispatch<React.SetStateAction<AuthData | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authData, setAuthData] = useState<AuthData | null>(null);

    const value = {
        authData,
        setAuthData,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
