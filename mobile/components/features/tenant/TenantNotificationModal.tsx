import React, { useState } from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import { Flex, Text, Button, TextInput } from "@eduinteractive/balladui";
import { IconX } from "@/assets/icons/Icon";

interface TenantNotificationModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (content: string) => void;
}

const TenantNotificationModal: React.FC<TenantNotificationModalProps> = ({ visible, onClose, onSubmit }) => {
	const [content, setContent] = useState("");

	const handleSubmit = () => {
		if (content.trim()) {
			onSubmit(content.trim());
			setContent("");
		}
	};

	const handleClose = () => {
		setContent("");
		onClose();
	};

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="fade"
			onRequestClose={handleClose}
		>
			<View style={{
				flex: 1,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 20
			}}>
				<View style={{
					backgroundColor: 'white',
					borderRadius: 12,
					padding: 20,
					width: '100%',
					maxWidth: 500,
					shadowColor: '#000',
					shadowOffset: {
						width: 0,
						height: 2,
					},
					shadowOpacity: 0.25,
					shadowRadius: 3.84,
					elevation: 5,
				}}>
					{/* Modal Header */}
					<Flex
						direction="row"
						justify="space-between"
						align="center"
						mb="md"
					>
						<Text
							fs="lg"
							fw="bold"
						>
							Benachrichtigung senden
						</Text>
						<TouchableOpacity
							onPress={handleClose}
							style={{
								padding: 8,
								borderRadius: 4,
								backgroundColor: '#f1f3f4'
							}}
						>
							<IconX
								size={20}
								color="#666"
							/>
						</TouchableOpacity>
					</Flex>

					{/* Modal Body */}
					<Flex
						direction="column"
						gap="md"
						mb="2xl"
					>
						<Text
							fs="sm"
							c="gray.6"
						>
							Senden Sie eine Benachrichtigung an alle Mitglieder Ihrer
							Gruppe.
						</Text>

						<TextInput
							label="Geben Sie hier Ihre Nachricht ein..."
							value={content}
							onChangeText={setContent}
							multiline
							numberOfLines={4}
						/>
					</Flex>

					{/* Modal Footer */}
					<Flex
						direction="row"
						gap="sm"
						style={{ width: "100%" }}
                        mt="md"
					>
						<Button
							variant="outline"
							onPress={handleClose}
							style={{ flex: 1, borderWidth: 1 }}
						>
							Abbrechen
						</Button>

						<Button
							variant="filled"
							onPress={handleSubmit}
							disabled={!content.trim()}
							style={{ flex: 1 }}
						>
							Senden
						</Button>
					</Flex>
				</View>
			</View>
		</Modal>
	);
};

export default TenantNotificationModal;
