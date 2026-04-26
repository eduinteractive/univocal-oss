import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWikiSection } from "@/api/Wiki";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import {
	RichText,
	useEditorBridge,
	Toolbar,
	PlaceholderBridge,
	TenTapStartKit,
} from "@10play/tentap-editor";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { applySizeProp, Box, Button, Flex, applyColor } from "@eduinteractive/balladui";
import { IconCheck } from "@/assets/icons/Icon";

export default () => {
	const params = useLocalSearchParams();
	const wikiId = typeof params.wikiId === "string" ? params.wikiId : "";
	const { currentTenant } = useTenant();
	const router = useRouter();
	const navigation = useNavigation();
	const [content, setContent] = useState<string>("");
	const [title, setTitle] = useState<string>("");
	const queryClient = useQueryClient();

	const editor = useEditorBridge({
		autofocus: true,
		avoidIosKeyboard: false,
		initialContent: "",
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

	const createMutation = useMutation({
		mutationFn: createWikiSection,
		onSuccess: () => {
			NotificationHandler.showSuccess("Wiki-Abschnitt erstellt");
			queryClient.invalidateQueries({ queryKey: ["wiki", currentTenant!._id, wikiId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Button
					variant="subtle"
					size="sm"
					loading={createMutation.isPending}
					onPress={() =>
						createMutation.mutate({
							tenantId: currentTenant!._id,
							wikiId,
							body: {
								title,
								content,
							},
						})
					}
				>
					<IconCheck
						size={22}
						color={applyColor("blue")}
					/>
				</Button>
			),
		});
	}, [navigation, content, title, createMutation.isPending]);

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
					<Toolbar editor={editor} />
				</Box>
			</Flex>
		</KeyboardAvoidingView>
	);
};
