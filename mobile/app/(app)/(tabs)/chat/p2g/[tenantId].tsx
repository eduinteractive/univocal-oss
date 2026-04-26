import { getGroupChatMessages, GroupMessage, reportGroupMessage, sendGroupChatMessage } from "@/api/Chat";
import ChatMessageEditor from "@/components/features/chat/ChatMessageEditor";
import ChatMessageList from "@/components/features/chat/ChatMessageList";
import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSocket } from "@/context/SocketContext";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { useAuth } from "@/context/AuthContext";
import { getTenant } from "@/api/Tenant";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { applySizeProp } from "@eduinteractive/balladui";

export default () => {
	const { authData } = useAuth();
    const { tenantId } = useLocalSearchParams();
	const socket = useSocket();
	const [messages, setMessages] = useState<GroupMessage[]>([]);
	const [isSending, setIsSending] = useState(false);
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
	const navigation = useNavigation();

	const messageQuery = useQuery({
		queryKey: ["groupMessages", tenantId],
		queryFn: () => getGroupChatMessages(tenantId as string),
	});

	const tenantQuery = useQuery({
		queryKey: ["tenant", tenantId],
		queryFn: () => getTenant({ id: tenantId as string }),
	});

    const sendGroupMessageMutation = useMutation({
        mutationFn: sendGroupChatMessage,
        onError: NotificationHandler.showAxiosError,
    })

	const reportMessageMutation = useMutation({
		mutationFn: reportGroupMessage,
		onSuccess: () => {
			NotificationHandler.showSuccess('Die Nachricht wurde erfolgreich gemeldet!');
		},
		onError: NotificationHandler.showAxiosError,
	});

	useLayoutEffect(() => {
		if (tenantQuery.data) {
			navigation.setOptions({
				title: tenantQuery.data.tenant.title,
			});
		}
	}, [tenantQuery.data]);

	const handleNewMessage = useCallback(
		(newMessage: GroupMessage) => {
			setMessages((prevMessages) => {
				if (prevMessages.some((msg) => msg._id === newMessage._id)) {
					return prevMessages;
				}
				return [...prevMessages, newMessage];
			});
			socket?.emit("markGAsSeen", tenantId);

			// If this is our pending message, clear the loading state
			if (
				pendingMessage &&
				newMessage.content === pendingMessage &&
				newMessage.authorId === authData?._id
			) {
				setIsSending(false);
				setPendingMessage(null);
				if (timeoutId) clearTimeout(timeoutId);
			}
		},
		[socket, tenantId, pendingMessage]
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

                sendGroupMessageMutation.mutate({
                    tenantId: tenantId as string,
                    body: {
                        content: message,
                        files: filesToSend,
                    }
                });
			}
		},
		[socket, tenantId, sendGroupMessageMutation, pendingMessage]
	);

	useEffect(() => {
		if (messageQuery.data) {
			setMessages(messageQuery.data);
			if (messageQuery.data?.find((msg) => !msg.seenBy.includes(authData?._id as string))) {
				socket?.emit("markGAsSeen", tenantId);
			}
		}
	}, [messageQuery.data]);

	useEffect(() => {
		if (socket) {
			socket.on("newGroupMessage", (message: GroupMessage) => {
				handleNewMessage(message);
			});
		}

		return () => {
			if (socket) {
				socket.off("newGroupMessage");
			}
		};
	}, [socket, handleNewMessage]);

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, padding: applySizeProp("xs") }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<ChatMessageList
				messages={messages}
				users={tenantQuery.data?.users}
				onReport={(msgId, author) => {
					reportMessageMutation.mutate({
						body: {
							messageId: msgId,
							author: author || "",
							group: tenantQuery.data?.tenant?.title || "",
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
