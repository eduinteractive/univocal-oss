import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL } from '@/api/APIHandler';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { authToken } = useAuth();

    useEffect(() => {
        if (!authToken) {
            if (socket) {
                socket.close();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(`${BASE_URL}`, {
            path: '/api/chat/socket.io',
            transports: ['websocket'],
            auth: {
                token: authToken
            },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
        });

        newSocket.on('reconnect_attempt', () => {
            console.log('Attempting to reconnect...');
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected successfully on attempt', attemptNumber);
        });

        newSocket.on('reconnect_failed', () => {
            console.error('Reconnection failed');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [authToken]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}; 