import { IconMail, IconFile, IconDownload, IconX } from "@/assets/icons/Icon";
import { ActionSheet, Card, Text, Flex, Box } from "@eduinteractive/balladui";
import { useState } from "react";
import { Alert, Linking, TouchableOpacity, Image, Modal, View, Dimensions } from "react-native";
import { BASE_URL } from "@/api/APIHandler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

interface ChatMessageProps {
	message: string;
	files: {
		title: string;
		link: string;
		mimetype: string;
	}[];
	author: string;
	timestamp: Date;
	isOwnMessage: boolean;
	onReport: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ChatMessage = (props: ChatMessageProps) => {
	const [actionSheetVisible, setActionSheetVisible] = useState(false);
	const [imageModalVisible, setImageModalVisible] = useState(false);
	const [selectedImageUri, setSelectedImageUri] = useState<string>("");

	// Zoom and pan values for the image viewer
	const scale = useSharedValue(1);
	const savedScale = useSharedValue(1);
	const translateX = useSharedValue(0);
	const savedTranslateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const savedTranslateY = useSharedValue(0);

	const handleReport = async () => {
		Alert.alert(
			"Nachricht melden",
			"Möchtest du diese Nachricht melden? Sie wird dann von einem Administrator der Plattform überprüft, der entsprechende Maßnahmen ergreifen wird.",
			[
				{ text: "Abbrechen", style: "cancel" },
				{ text: "Nachricht melden", onPress: () => props.onReport() },
			]
		);
	};

	const handleLinkPress = async (url: string) => {
		const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
		const canOpen = await Linking.canOpenURL(formattedUrl);
		if (canOpen) {
			await Linking.openURL(formattedUrl);
		} else {
			Alert.alert("Fehler", "Diese URL konnte nicht geöffnet werden.");
		}
	};

	const isImageFile = (mimetype: string) => {
		return mimetype.startsWith("image/");
	};

	const handleFileDownload = async (fileLink: string) => {
		const downloadUrl = `${BASE_URL}/api/event/public/event/unknown/download/${encodeURIComponent(
			fileLink
		)}`;
		const canOpen = await Linking.canOpenURL(downloadUrl);
		if (canOpen) {
			await Linking.openURL(downloadUrl);
		} else {
			Alert.alert("Fehler", "Die Datei konnte nicht geöffnet werden.");
		}
	};

	const handleImagePress = (fileLink: string) => {
		const imageUrl = `${BASE_URL}/api/profile/image/${encodeURIComponent(fileLink)}`;
		setSelectedImageUri(imageUrl);
		setImageModalVisible(true);
		// Reset zoom and pan values
		scale.value = 1;
		savedScale.value = 1;
		translateX.value = 0;
		savedTranslateX.value = 0;
		translateY.value = 0;
		savedTranslateY.value = 0;
	};

	const closeImageModal = () => {
		setImageModalVisible(false);
		// Reset zoom and pan values
		scale.value = 1;
		savedScale.value = 1;
		translateX.value = 0;
		savedTranslateX.value = 0;
		translateY.value = 0;
		savedTranslateY.value = 0;
	};

	// Pinch gesture for zoom
	const pinchGesture = Gesture.Pinch()
		.onUpdate((e) => {
			scale.value = savedScale.value * e.scale;
		})
		.onEnd(() => {
			savedScale.value = scale.value;
			// Limit zoom between 1x and 5x
			if (scale.value < 1) {
				scale.value = withTiming(1);
				savedScale.value = 1;
			} else if (scale.value > 5) {
				scale.value = withTiming(5);
				savedScale.value = 5;
			}
		});

	// Pan gesture for dragging when zoomed
	const panGesture = Gesture.Pan()
		.onUpdate((e) => {
			if (scale.value > 1) {
				translateX.value = savedTranslateX.value + e.translationX;
				translateY.value = savedTranslateY.value + e.translationY;
			}
		})
		.onEnd(() => {
			savedTranslateX.value = translateX.value;
			savedTranslateY.value = translateY.value;
		});

	// Combined gestures
	const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

	// Animated style for the image
	const imageAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value },
				{ scale: scale.value },
			],
		};
	});


	const messageTime = new Date(props.timestamp).toLocaleTimeString("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<Box
			mb="xs"
			style={{
				alignSelf: props.isOwnMessage ? "flex-end" : "flex-start",
				maxWidth: "75%",
			}}
		>
			<TouchableOpacity
				onLongPress={() => (props.isOwnMessage ? () => {} : setActionSheetVisible(true))}
				delayLongPress={500}
				activeOpacity={0.9}
			>
				<ActionSheet
					visible={actionSheetVisible}
					onClose={() => setActionSheetVisible(false)}
					title="Einstellungen"
					options={[
						{
							label: "Nachricht melden",
							value: "report",
							icon: <IconMail size={20} />,
						},
					]}
					onSelect={(option) => {
						if (option === "report") {
							handleReport();
						}
					}}
				/>
				<Box
					style={{
						backgroundColor: props.isOwnMessage ? "#1E96FC" : "#FFF",
						borderRadius: 18,
						borderTopRightRadius: props.isOwnMessage ? 4 : 18,
						borderTopLeftRadius: props.isOwnMessage ? 18 : 4,
						paddingHorizontal: 12,
						paddingVertical: 8,
						marginBottom: 2,
						shadowColor: "#000",
						shadowOffset: {
							width: 0,
							height: 1,
						},
						shadowOpacity: 0.1,
						shadowRadius: 2,
						elevation: 2,
					}}
				>
					<Flex direction="column" gap="xs">
						{/* Author name (only for received messages) */}
						{!props.isOwnMessage && (
							<Text
								fs="xs"
								fw="600"
								style={{
									color: "#1E96FC",
									marginBottom: 2,
								}}
							>
								{props.author}
							</Text>
						)}

						{/* Files Display */}
						{props.files && props.files.length > 0 && (
							<Flex
								direction="column"
								gap="xs"
							>
								{props.files.map((file, index) => (
									<Box
										key={index}
										style={{
											backgroundColor: props.isOwnMessage
												? "rgba(255, 255, 255, 0.15)"
												: "rgba(255, 255, 255, 0.8)",
											borderRadius: 12,
											overflow: "hidden",
											marginBottom: index < props.files.length - 1 ? 8 : 0,
										}}
									>
										<TouchableOpacity
											onPress={() =>
												isImageFile(file.mimetype)
													? handleImagePress(file.link)
													: handleFileDownload(file.link)
											}
											activeOpacity={0.8}
											style={{
												width: "100%",
												aspectRatio: 1,
												maxHeight: 150,
												borderRadius: 12,
												overflow: "hidden",
											}}
										>
											{isImageFile(file.mimetype) ? (
												<Image
													source={{
														uri: `${BASE_URL}/api/profile/image/${encodeURIComponent(
															file.link
														)}`,
													}}
													style={{
														width: "100%",
														height: "100%",
													}}
													resizeMode="cover"
												/>
											) : (
												<Box
													style={{
														width: "100%",
														height: "100%",
														backgroundColor: props.isOwnMessage
															? "rgba(255, 255, 255, 0.2)"
															: "#E9ECEF",
														justifyContent: "center",
														alignItems: "center",
														position: "relative",
													}}
												>
													<IconFile
														size={48}
														color={
															props.isOwnMessage ? "#FFFFFF" : "#495057"
														}
													/>
													{/* Download icon overlay */}
													<Box
														style={{
															position: "absolute",
															bottom: 25,
															right: 8,
															backgroundColor: props.isOwnMessage
																? "rgba(0, 0, 0, 0.3)"
																: "rgba(255, 255, 255, 0.9)",
															borderRadius: 16,
															padding: 6,
														}}
													>
														<IconDownload
															size={16}
															color={
																props.isOwnMessage ? "#FFFFFF" : "#495057"
															}
														/>
													</Box>
													{/* File name overlay at bottom */}
													<Box
														style={{
															position: "absolute",
															bottom: 0,
															left: 0,
															right: 0,
															backgroundColor: props.isOwnMessage
																? "rgba(0, 0, 0, 0.4)"
																: "rgba(0, 0, 0, 0.6)",
															paddingHorizontal: 8,
															paddingVertical: 4,
														}}
													>
														<Text
															fs="xs"
															fw="500"
															numberOfLines={1}
															style={{
																color: "#FFFFFF",
																textAlign: "center",
															}}
														>
															{file.title}
														</Text>
													</Box>
												</Box>
											)}
										</TouchableOpacity>
									</Box>
								))}
							</Flex>
						)}

						{/* Message Content */}
						{props.message && (
							<Box>
								{(() => {
		const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g;
		const parts: (string | { url: string; text: string })[] = [];
		let lastIndex = 0;
		let match;

		while ((match = urlRegex.exec(props.message)) !== null) {
			if (match.index > lastIndex) {
				const textBefore = props.message.substring(lastIndex, match.index);
				if (textBefore) {
					parts.push(textBefore);
				}
			}
			parts.push({ url: match[0], text: match[0] });
			lastIndex = match.index + match[0].length;
		}

		if (lastIndex < props.message.length) {
			const textAfter = props.message.substring(lastIndex);
			if (textAfter) {
				parts.push(textAfter);
			}
		}

		if (parts.length === 0) {
										return (
											<Text
												fs="sm"
												style={{
													color: props.isOwnMessage ? "#FFFFFF" : "#212529",
													lineHeight: 20,
												}}
											>
												{props.message}
											</Text>
										);
		}

		return (
										<Text
											fs="sm"
											style={{
												color: props.isOwnMessage ? "#FFFFFF" : "#212529",
												lineHeight: 20,
											}}
										>
				{parts.map((part, index) => {
					if (typeof part === "string") {
						return <Text key={index}>{part}</Text>;
					} else {
						return (
							<Text
								key={index}
								onPress={() => handleLinkPress(part.url)}
								style={{
																color: props.isOwnMessage ? "#FFFFFF" : "#1E96FC",
									textDecorationLine: "underline",
								}}
							>
								{part.text}
							</Text>
						);
					}
				})}
			</Text>
		);
								})()}
							</Box>
						)}

						{/* Timestamp */}
						<Flex
							direction="row"
							justify="flex-end"
							align="center"
							style={{ marginTop: 4 }}
						>
							<Text
								fs="xs"
			style={{
									color: props.isOwnMessage
										? "rgba(255, 255, 255, 0.7)"
										: "rgba(0, 0, 0, 0.5)",
									fontSize: 11,
								}}
							>
								{messageTime}
							</Text>
						</Flex>
					</Flex>
				</Box>
			</TouchableOpacity>
			{/* Image Zoom Modal */}
			<Modal
				visible={imageModalVisible}
				transparent={true}
				animationType="fade"
				onRequestClose={closeImageModal}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: "rgba(0, 0, 0, 0.9)",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					{/* Close Button */}
					<TouchableOpacity
						onPress={closeImageModal}
						style={{
							position: "absolute",
							top: 50,
							right: 20,
							zIndex: 1000,
							backgroundColor: "rgba(255, 255, 255, 0.2)",
							borderRadius: 20,
							padding: 10,
						}}
					>
						<IconX
							size={24}
							color="#FFFFFF"
						/>
		</TouchableOpacity>

					{/* Zoomable Image */}
					<GestureDetector gesture={composedGesture}>
						<Animated.View
							style={[
								{
									width: SCREEN_WIDTH,
									height: SCREEN_HEIGHT,
									justifyContent: "center",
									alignItems: "center",
								},
							]}
						>
							<Animated.Image
								source={{ uri: selectedImageUri }}
								style={[
									{
										width: SCREEN_WIDTH,
										height: SCREEN_HEIGHT,
										resizeMode: "contain",
									},
									imageAnimatedStyle,
								]}
							/>
						</Animated.View>
					</GestureDetector>
				</View>
			</Modal>
		</Box>
	);
};

export default ChatMessage;
