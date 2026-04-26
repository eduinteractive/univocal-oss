import { GroupMessage, PrivateMessage } from "@/api/Chat";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { FlatList, View, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import ChatMessage from "./ChatMessage";
import { User } from "@/api/User";
import { TenantUser } from "@/api/Tenant";
import ChatMessagesFab from "./ChatMessagesFab";
import React from "react";
import { Flex, Text, applySizeProp } from "@eduinteractive/balladui";

interface ChatMessageListProps {
	messages: PrivateMessage[] | GroupMessage[];
	private?: boolean;
	users?: TenantUser[] | User;
	onReport: (messageId: string, name?: string) => void;
}

const ChatMessageList = (props: ChatMessageListProps) => {
	const { authData } = useAuth();
	const [newMessageCount, setNewMessageCount] = useState(0);
	const flatListRef = useRef<FlatList>(null);
	const [isNearBottom, setIsNearBottom] = useState(true);
	const lastMessageCount = useRef(props.messages.length);
	const shouldAutoScroll = useRef(true);
	const hasInitialScroll = useRef(false);
	const isInitialLoad = useRef(props.messages.length === 0);

	const getUserNameById = (userId: string) => {
		if (props.users) {
			if (props.private) {
				if (userId === authData?._id) {
					const contact = authData.contact as unknown as {
						first_name: string;
						last_name: string;
					};
					return contact.first_name + " " + contact.last_name;
				} else {
					return (props.users as User).firstName + " " + (props.users as User).lastName;
				}
			} else {
                const user = (props.users as TenantUser[]).find((user) => user._id === userId);
                if (user) {
                    return user.firstName + " " + user.lastName;
                }
			}
		}
		return "Unbekannte*r Absender*in";
	};

	const messagesByDate = useMemo(() => {
		const groups: { [key: string]: Array<GroupMessage | PrivateMessage> } = {};
		props.messages.forEach((msg) => {
			const dateKey = new Date(msg.creationDate).toLocaleDateString("de-DE");
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(msg);
		});
		return groups;
	}, [props.messages]);

	const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
		const paddingToBottom = 20;
		const isCloseToBottom =
			layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

		setIsNearBottom(isCloseToBottom);
		shouldAutoScroll.current = isCloseToBottom;
		if (isCloseToBottom) {
			setNewMessageCount(0);
		}
	}, []);

	const scrollToBottom = useCallback(() => {
		flatListRef.current?.scrollToEnd({ animated: true });
		setNewMessageCount(0);
		shouldAutoScroll.current = true;
	}, []);

	const handleContentSizeChange = useCallback(() => {
		if (shouldAutoScroll.current && hasInitialScroll.current) {
			// Only auto-scroll on content size change if user is at bottom
			// This prevents jumping when user is reading older messages
			if (isNearBottom) {
				flatListRef.current?.scrollToEnd({ animated: false });
			}
		} else if (isInitialLoad.current && !hasInitialScroll.current && props.messages.length > 0) {
			// Use a small delay for initial load to ensure layout is complete
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: false });
				hasInitialScroll.current = true;
				isInitialLoad.current = false;
			}, 100);
		}
	}, [props.messages.length, isNearBottom]);

	// Handle initial load - scroll to bottom when messages first appear
	useEffect(() => {
		if (props.messages.length > 0 && !hasInitialScroll.current) {
			// Wait for layout to complete, then scroll
			setTimeout(() => {
				if (flatListRef.current && props.messages.length > 0) {
					shouldAutoScroll.current = true;
					flatListRef.current.scrollToEnd({ animated: false });
					hasInitialScroll.current = true;
					isInitialLoad.current = false;
				}
			}, 300);
		}
	}, [props.messages.length]);

	// Auto-scroll when new message arrives and user is at bottom
	useEffect(() => {
		if (
			props.messages.length > lastMessageCount.current &&
			hasInitialScroll.current &&
			isNearBottom &&
			shouldAutoScroll.current
		) {
			// Small delay to ensure the new message is rendered
			setTimeout(() => {
				if (flatListRef.current && isNearBottom) {
					flatListRef.current.scrollToEnd({ animated: true });
					setNewMessageCount(0);
				}
			}, 100);
		}
	}, [props.messages.length, isNearBottom]);

	// Update new message count when messages change
	useEffect(() => {
		if (props.messages.length > lastMessageCount.current) {
			if (!isNearBottom && hasInitialScroll.current) {
				setNewMessageCount((prev) => prev + (props.messages.length - lastMessageCount.current));
			} else if (isNearBottom && hasInitialScroll.current) {
				// User is at bottom, clear the count since we're auto-scrolling
				setNewMessageCount(0);
			}
		}
		lastMessageCount.current = props.messages.length;
	}, [props.messages.length, isNearBottom]);

	return (
		<View style={{ flex: 1 }}>
			<FlatList
				ref={flatListRef}
				data={Object.entries(messagesByDate) || []}
				keyExtractor={([date]) => date}
				renderItem={({ item }) => (
					<Flex
						align="center"
						direction="column"
					>
						<Text
							fs="xs"
							c="gray.5"
							mt="sm"
							mb="sm"
						>
							{item[0]}
						</Text>
						{item[1].map((msg: GroupMessage | PrivateMessage) => (
							<ChatMessage
								key={msg._id}
								message={msg.content}
                                files={msg.files}
								author={getUserNameById(msg.authorId)}
								timestamp={msg.creationDate}
								isOwnMessage={msg.authorId === authData?._id}
								onReport={() => {
									props.onReport(msg._id, getUserNameById(msg.authorId));
								}}
							/>
						))}
					</Flex>
				)}
				contentContainerStyle={{ padding: applySizeProp("sm") }}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				onContentSizeChange={handleContentSizeChange}
				onLayout={handleContentSizeChange}
			/>
			<ChatMessagesFab
				count={newMessageCount}
				onPress={scrollToBottom}
			/>
		</View>
	);
};

export default ChatMessageList;
