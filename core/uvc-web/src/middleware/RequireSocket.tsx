import { Outlet } from 'react-router-dom';
import { SocketProvider, useSocket } from '../context/SocketContext';
import { useEffect } from 'react';

const RequireSocket = () => {
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            socket.connect();
        }
    }, [socket]);

    return (
        <SocketProvider>
            <Outlet />
        </SocketProvider>
    );
};

export default RequireSocket;
