import { useNavigation } from "expo-router";
import { useState, useLayoutEffect } from "react";
import { RichText, useEditorBridge, Toolbar, PlaceholderBridge, TenTapStartKit, DEFAULT_TOOLBAR_ITEMS, Images } from "@10play/tentap-editor";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { applyColor, applySizeProp, Box, Button, Flex } from "@eduinteractive/balladui";
import { IconCheck } from "@/assets/icons/Icon";

interface ContentEditorProps {
	initialTitle?: string;
	initialContent?: string;
	onSave: (data: { title: string; content: string }) => void;
	isLoading?: boolean;
}

const ContentEditor = ({ initialTitle = "", initialContent = "", onSave, isLoading = false }: ContentEditorProps) => {
	const navigation = useNavigation();
	const [content, setContent] = useState<string>("");
	const [title, setTitle] = useState<string>(initialTitle);

	useLayoutEffect(() => {
		setTitle(initialTitle);
	}, [initialTitle]);

	const editor = useEditorBridge({
		autofocus: false,
		avoidIosKeyboard: false,
		initialContent: initialContent,
		bridgeExtensions: [
			...TenTapStartKit,
			PlaceholderBridge.configureExtension({
				placeholder: "Inhalt einfügen...",
			}),
		],
		onChange: () => {
			if (editor) {
				editor.getHTML().then((html) => setContent(html));
			}
		},
	});

	const handleSave = () => {
		onSave({ title, content });
	};

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Button
					variant="subtle"
					size="sm"
					loading={isLoading}
					onPress={handleSave}
				>
					<IconCheck
						size={22}
						color={applyColor("blue")}
					/>
				</Button>
			),
		});
	}, [navigation, content, title, isLoading]);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<Flex
				flex={1}
				bg="white"
				p="xs"
				position="relative"
				direction="column"
			>
				<TextInput
					value={title}
					onChangeText={setTitle}
					placeholder="Titel"
					style={{
						fontSize: 20,
						fontWeight: "bold",
						marginTop: applySizeProp("sm"),
					}}
				/>
				<RichText
					style={{
						height: "100%",
					}}
					editor={editor}
				/>

				<Box
					position="absolute"
					bottom={0}
					left={0}
					right={0}
					style={{
						backgroundColor: "gray",
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
					}}
				>
					<Toolbar
						editor={editor}
						items={[
							{
								onPress: () => () => {
									editor.blur();
								},
								active: () => true,
								disabled: () => false,
								image: () => Images.close,
							},
							...DEFAULT_TOOLBAR_ITEMS,
						]}
					/>
				</Box>
			</Flex>
		</KeyboardAvoidingView>
	);
};

export default ContentEditor;
