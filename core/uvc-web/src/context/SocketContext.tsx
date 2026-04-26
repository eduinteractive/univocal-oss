import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

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

    useEffect(() => {
        const newSocket = io(`${import.meta.env.VITE_KUBERNETES_HOST}`, {
            path: '/api/chat/socket.io',
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true, // Aktiviert automatische Wiederverbindung
            reconnectionAttempts: Infinity, // Anzahl der Wiederverbindungsversuche, hier unendlich
            reconnectionDelay: 1000, // Zeit in Millisekunden bis zum ersten Wiederverbindungsversuch
            reconnectionDelayMax: 5000, // Maximale Zeit in Millisekunden zwischen Wiederverbindungsversuchen
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
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
