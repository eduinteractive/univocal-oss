import React from "react";
import { getPrivateChatMessages, reportPrivateMessage, sendPrivateChatMessage } from "@/api/Chat";
import ChatMessageEditor from "@/components/features/chat/ChatMessageEditor";
import ChatMessageList from "@/components/features/chat/ChatMessageList";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSocket } from "@/context/SocketContext";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { PrivateMessage } from "@/api/Chat";
import { getUserNameById } from "@/api/User";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { useAuth } from "@/context/AuthContext";

export default () => {
	const { authData } = useAuth();
	const { recipientId } = useLocalSearchParams();
	const socket = useSocket();
	const [messages, setMessages] = useState<PrivateMessage[]>([]);
	const [isSending, setIsSending] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const navigation = useNavigation();


	const privateMessages = useQuery({
		queryKey: ["privateMessages", recipientId],
		queryFn: () => getPrivateChatMessages(recipientId as string),
	});

	const recipientQuery = useQuery({
		queryKey: ["user", recipientId],
		queryFn: () => getUserNameById(recipientId as string),
	});

    const reportMessageMutation = useMutation({
        mutationFn: reportPrivateMessage,
        onSuccess: () => {
            NotificationHandler.showSuccess('Die Nachricht wurde erfolgreich gemeldet!');
        },
        onError: NotificationHandler.showAxiosError,
    });

    const sendPrivateMessageMutation = useMutation({
        mutationFn: sendPrivateChatMessage,
        onError: NotificationHandler.showAxiosError,
    });

    useLayoutEffect(() => {
        if (recipientQuery.data) {
            navigation.setOptions({
                title: recipientQuery.data.firstName + " " + recipientQuery.data.lastName,
                headerBackTitle: "Zurück",
                headerBackVisible: true,
            });
        }
    }, [recipientQuery.data]);

	const handleNewMessage = useCallback(
		(newMessage: PrivateMessage) => {
			setMessages((prevMessages) => {
				if (prevMessages.some((msg) => msg._id === newMessage._id)) {
					return prevMessages;
				}
				return [...prevMessages, newMessage];
			});
			socket?.emit("markPAsSeen", recipientId);

			// If this is our pending message, clear the loading state
			if (
				pendingMessage !== undefined&&
				newMessage.content === pendingMessage &&
				newMessage.authorId === authData?._id
			) {
				setIsSending(false);
				setPendingMessage(null);
				if (timeoutId) clearTimeout(timeoutId);
			}
		},
		[socket, recipientId, pendingMessage]
	);

	const handleSendMessage = useCallback(
		(message: string, files?: Array<{ uri: string; name: string; type: string; size?: number }>) => {
			if (socket) {
				if (!socket.connected) {
					socket.connect();
					return;
				}

				setIsSending(true);
				setPendingMessage(message);

				// Add a timeout to prevent infinite loading state
				setTimeoutId(
					setTimeout(() => {
						if (pendingMessage) {
							setIsSending(false);
							setPendingMessage(null);
							NotificationHandler.showError(
								"Nachricht konnte nicht gesendet werden. Bitte versuche es erneut."
							);
						}
					}, 5000) as unknown as NodeJS.Timeout
				); // 5 second timeout

				// Convert files to File-like objects for FormData
				const filesToSend = files?.map((file) => ({
					uri: file.uri,
					name: file.name,
					type: file.type,
				} as any)) as File[] | undefined;

				sendPrivateMessageMutation.mutate({
					recipientId: recipientId as string,
					body: {
						content: message,
						files: filesToSend,
					}
				});
			}
		},
		[socket, recipientId, sendPrivateMessageMutation, pendingMessage]
	);

	useEffect(() => {
		if (privateMessages.data) {
			setMessages(privateMessages.data);
		}
	}, [privateMessages.data]);

	useEffect(() => {
		if (socket) {
			socket.on("newPrivateMessage", (message: PrivateMessage) => {
				handleNewMessage(message);
			});
		}

		return () => {
			if (socket) {
				socket.off("newPrivateMessage");
			}
		};
	}, [socket, handleNewMessage]);

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<ChatMessageList
				messages={messages}
				private
				users={recipientQuery.data}
				onReport={(msgId, author) => {
                    reportMessageMutation.mutate({
                        body: {
                            messageId: msgId,
                            author: author || "",
                            recipient: (authData?.contact as any)?.first_name + " " + (authData?.contact as any)?.last_name,
                        }
                    });
                }}
			/>
			<ChatMessageEditor
				onSend={handleSendMessage}
				isLoading={isSending}
			/>
		</KeyboardAvoidingView>
	);
};
