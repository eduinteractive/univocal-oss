import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PrivateMessage, SAPI, UserContact } from '@eduinteractive/uvc-api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Title } from '@mantine/core';
import { useSocket } from '../../context/SocketContext';
import ChatMessageContainer from '../../components/features/chat/ChatMessageContainer';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { useAuth } from '../../context/AuthContext';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

const Chat = () => {
    const { t } = useTranslation();
    const socket = useSocket();
    const { authData } = useAuth();
    const { userId } = useParams<{ userId: string }>();

    const [messages, setMessages] = useState<PrivateMessage[]>([]);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const messageQuery = useQuery({
        queryKey: ['P2P', userId],
        queryFn: () => SAPI.CHAT.PRIVATE.getPrivateChatMessages(userId),
    });

    const recipientQuery = useQuery({
        queryKey: ['user', userId],
        queryFn: () => SAPI.AUTH.PRIVATE.getUserNameById(userId),
    });

    const reportMessageMutation = useMutation({
        mutationFn: SAPI.CHAT.PRIVATE.reportPrivateMessage,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('PAGES.USER.CHAT.MESSAGE_REPORTED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const sendPrivateMessageMutation = useMutation({
        mutationFn: SAPI.CHAT.PRIVATE.sendPrivateChatMessage,
        onError: NotificationHandler.showAxiosError,
    })

    const handleSendMessage = (message: string, files?: File[]) => {
        if (userId) {
            sendPrivateMessageMutation.mutate({
                recipientId: userId!,
                body: {
                    content: message,
                    files: files,
                }
            })
        }
    };

    const handleNewMessage = useCallback(
        (newMessage: PrivateMessage) => {
            setMessages((prevMessages) => {
                // Prüfen, ob die Nachricht bereits im Zustand vorhanden ist
                if (prevMessages.some((msg) => msg._id === newMessage._id)) {
                    return prevMessages; // Keine Änderung, wenn die Nachricht schon vorhanden ist
                }
                return [...prevMessages, newMessage]; // Füge die neue Nachricht hinzu, wenn sie nicht vorhanden ist
            });
            socket?.emit('markPAsSeen', userId);
        },
        [socket, userId]
    );

    const handleReportMessage = (messageId: string) => {
        reportMessageMutation.mutate({
            body: {
                messageId: messageId,
                author:
                    recipientQuery.data?.firstName +
                    ' ' +
                    recipientQuery.data?.lastName,
                recipient:
                    (authData?.contact as UserContact).first_name +
                    ' ' +
                    (authData?.contact as UserContact).last_name,
            },
        });
    };

    useEffect(() => {
        if (messageQuery.data) {
            setMessages(messageQuery.data);
        }
    }, [messageQuery.data]);

    useEffect(() => {
        const initSocket = () => {
            if (socket) {
                socket.on('newPrivateMessage', (message: PrivateMessage) => {
                    handleNewMessage(message);
                });
                if (
                    messageQuery.data?.find(
                        (msg) =>
                            msg.recipientId === authData?._id &&
                            msg.seen === false
                    )
                ) {
                    socket.emit('markPAsSeen', userId);
                }
            } else {
                setTimeout(() => {
                    initSocket();
                }, 5000);
            }
        };

        initSocket();

        return () => {
            if (socket) {
                socket.off('newPrivateMessage');
            }
        };
    }, [authData?._id, handleNewMessage, messageQuery.data, socket, userId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="sm">
                {recipientQuery?.data?.firstName +
                    ' ' +
                    recipientQuery?.data?.lastName}
            </Title>
            <ChatMessageContainer
                messages={messages}
                users={recipientQuery?.data}
                private
                onSend={handleSendMessage}
                onReport={handleReportMessage}
            />
        </SVHPageWrapper>
    );
};

export default Chat;
