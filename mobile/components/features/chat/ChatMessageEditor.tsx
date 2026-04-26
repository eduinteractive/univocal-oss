import { IconSend, IconFiles, IconX, IconFile, IconLink, IconArrowDown } from "@/assets/icons/Icon";
import { Flex, applySizeProp, Box, Card, Text } from "@eduinteractive/balladui";
import { useState } from "react";
import { TextInput, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, Image, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";

interface SelectedFile {
	uri: string;
	name: string;
	type: string;
	size?: number;
}

interface ChatMessageEditorProps {
	onSend: (message: string, files?: SelectedFile[]) => void;
	isLoading?: boolean;
}

const ChatMessageEditor = ({ onSend, isLoading = false }: ChatMessageEditorProps) => {
	const [message, setMessage] = useState('');
	const [attachedFiles, setAttachedFiles] = useState<SelectedFile[]>([]);

	const isImageFile = (mimetype: string) => {
		return mimetype.startsWith("image/");
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes || bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const handlePickFile = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: "*/*",
				copyToCacheDirectory: true,
				multiple: true,
			});
			if (!result.canceled && result.assets) {
				const newFiles = result.assets.map((asset) => ({
					uri: asset.uri,
					name: asset.name || "Unbekannte Datei",
					type: asset.mimeType || "application/octet-stream",
					size: asset.size,
				}));
				setAttachedFiles(prev => [...prev, ...newFiles]);
			}
		} catch (error) {
			console.error("Error picking files:", error);
		}
	};

	const removeFile = (index: number) => {
		setAttachedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const handleSend = () => {
		if ((!message.trim() && attachedFiles.length === 0) || isLoading) return;
		onSend(message, attachedFiles.length > 0 ? attachedFiles : undefined);
		setMessage('');
		setAttachedFiles([]);
	};

	return (
		<Box bg="white" w="100%">
			{/* File Preview Section */}
			{attachedFiles.length > 0 && (
				<ScrollView 
					horizontal 
					showsHorizontalScrollIndicator={false}
					style={{ 
						paddingHorizontal: applySizeProp("sm"),
						paddingTop: applySizeProp("xs"),
						maxHeight: 100,
					}}
				>
					<Flex direction="row" gap="xs">
						{attachedFiles.map((file, index) => (
							<Card
								key={index}
								variant="outline"
								p="xs"
								style={{
									maxWidth: 150,
									borderColor: "#e0e0e0",
								}}
							>
								<Box position="relative">
									{isImageFile(file.type) ? (
										<Image
											source={{ uri: file.uri }}
											style={{
												width: 60,
												height: 60,
												borderRadius: 4,
											}}
											resizeMode="cover"
										/>
									) : (
										<Box
											style={{
												width: 60,
												height: 60,
												backgroundColor: "#f0f0f0",
												borderRadius: 4,
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											<IconFiles size={24} color="#666" />
										</Box>
									)}
									<TouchableOpacity
										onPress={() => removeFile(index)}
										style={{
											position: "absolute",
											top: -8,
											right: -8,
											backgroundColor: "rgba(0, 0, 0, 0.6)",
											borderRadius: 12,
											padding: 4,
										}}
									>
										<IconX size={16} color="#FFFFFF" />
									</TouchableOpacity>
								</Box>
								<Text
									fs="xs"
									numberOfLines={1}
									mt="xs"
								>
									{file.name}
								</Text>
								{file.size && (
									<Text
										fs="xs"
										c="gray.6"
									>
										{formatFileSize(file.size)}
									</Text>
								)}
							</Card>
						))}
					</Flex>
				</ScrollView>
			)}

			{/* Input Section */}
			<Flex style={styles.container} direction="row" align="center" bg="white" w="100%">
				<TouchableOpacity
					onPress={handlePickFile}
					disabled={isLoading}
					style={{
						padding: applySizeProp("xs"),
						marginRight: applySizeProp("xs"),
					}}
				>
					<IconLink
						size={24}
						color={isLoading ? "#ccc" : "#1E96FC"}
					/>
				</TouchableOpacity>
				<TextInput
					placeholder="Nachricht eingeben..."
					style={[styles.input]}
					multiline
					numberOfLines={4}
					value={message}
					onChangeText={setMessage}
					editable={!isLoading}
				/>
				<TouchableOpacity 
					style={{ padding: applySizeProp("xs") }}
					onPress={handleSend}
					disabled={isLoading || (!message.trim() && attachedFiles.length === 0)}
				>
					{isLoading ? (
						<ActivityIndicator color="#1E96FC" />
					) : (
						<IconSend
							size={24}
							color={(message.trim() || attachedFiles.length > 0) ? "#1E96FC" : "#ccc"}
						/>
					)}
				</TouchableOpacity>
			</Flex>
		</Box>
	);
};

const styles = StyleSheet.create({
	container: {
        padding: applySizeProp("sm")
	},
	input: {
		borderColor: "#ccc",
		borderRadius: 8,
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: Platform.OS === "ios" ? 10 : 6,
		fontSize: 14,
		textAlignVertical: "top", // wichtig für Android
        flexGrow: 1,
	},
});

export default ChatMessageEditor;
