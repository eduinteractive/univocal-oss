import { useMutation, useQuery } from '@tanstack/react-query';
import { GroupMessage, SAPI } from '@eduinteractive/uvc-api';
import { useCallback, useEffect, useState } from 'react';
import { Group, Text, Title } from '@mantine/core';
import { useSocket } from '../../context/SocketContext';
import { useTenant } from '../../context/TenantContext';
import ChatMessageContainer from '../../components/features/chat/ChatMessageContainer';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHPrivacyDisclaimer from '../../components/common/SVHPrivacyDisclaimer';
import { useTranslation } from 'react-i18next';

const GroupChat = () => {
    const socket = useSocket();
    const { currentTenant } = useTenant();
    const { t } = useTranslation();

    const [messages, setMessages] = useState<GroupMessage[]>([]);

    const messageQuery = useQuery({
        queryKey: ['P2G', currentTenant?._id],
        queryFn: () =>
            SAPI.CHAT.PRIVATE.getGroupChatMessages(currentTenant?._id),
    });

    const tenantMemberQuery = useQuery({
        queryKey: ['tenant', currentTenant?._id],
        queryFn: () => SAPI.TENANT.TENANT.getTenant({ id: currentTenant?._id }),
    });

    const reportMessageMutation = useMutation({
        mutationFn: SAPI.CHAT.PRIVATE.reportGroupMessage,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.GROUP_CHAT.SUCCESS.MESSAGE_REPORTED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const sendGroupMessageMutation = useMutation({
        mutationFn: SAPI.CHAT.PRIVATE.sendGroupChatMessage,
        onError: NotificationHandler.showAxiosError,
    });

    const handleSendMessage = (message: string, files?: File[]) => {
        if (currentTenant?._id) {
            sendGroupMessageMutation.mutate({
                tenantId: currentTenant._id,
                body: {
                    content: message,
                    files: files,
                },
            });
        }
    };

    const handleNewMessage = useCallback(
        (newMessage: GroupMessage) => {
            setMessages((prevMessages) => {
                // Prüfen, ob die Nachricht bereits im Zustand vorhanden ist
                if (prevMessages.some((msg) => msg._id === newMessage._id)) {
                    return prevMessages; // Keine Änderung, wenn die Nachricht schon vorhanden ist
                }
                return [...prevMessages, newMessage]; // Füge die neue Nachricht hinzu, wenn sie nicht vorhanden ist
            });
            socket?.emit('markGAsSeen', currentTenant?._id);
        },
        [socket, currentTenant]
    );

    const handleReportMessage = (messageId: string, name?: string) => {
        reportMessageMutation.mutate({
            body: {
                messageId: messageId,
                author: name || '',
                group: currentTenant?.tenant?.title || '',
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
                socket.on('newGroupMessage', (message: GroupMessage) => {
                    handleNewMessage(message);
                });
                if (
                    messageQuery.data?.find(
                        (msg) => !msg.seenBy.includes(currentTenant!._id)
                    )
                ) {
                    socket.emit('markGAsSeen', currentTenant?._id);
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
                socket.off('newGroupMessage');
            }
        };
    }, [currentTenant, handleNewMessage, messageQuery.data, socket]);

    return (
        <SVHPageWrapper p="md">
            <Group gap="xs">
                <Title order={3} c="blue">
                    {t('TENANT_PAGES.GROUP_CHAT.TITLE')}
                </Title>
                <SVHPrivacyDisclaimer />
            </Group>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.GROUP_CHAT.DESCRIPTION')}
            </Text>
            <ChatMessageContainer
                messages={messages}
                users={tenantMemberQuery?.data?.users}
                private={false}
                onSend={handleSendMessage}
                onReport={handleReportMessage}
            />
        </SVHPageWrapper>
    );
};

export default GroupChat;
