import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWikiSection, updateWikiSection, WikiSection } from "../../../../../../../../api/Wiki";
import { useTenant } from "../../../../../../../../context/TenantContext";
import { useState, useLayoutEffect } from "react";
import {
	RichText,
	useEditorBridge,
	Toolbar,
	PlaceholderBridge,
	TenTapStartKit,
	DEFAULT_TOOLBAR_ITEMS,
    Images,
} from "@10play/tentap-editor";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { applyColor, applySizeProp, Box, Button, Flex, Text } from "@eduinteractive/balladui";
import { IconCheck } from "@/assets/icons/Icon";

export default () => {
	const params = useLocalSearchParams();
	const wikiId = typeof params.wikiId === "string" ? params.wikiId : "";
	const sectionId = typeof params.sectionId === "string" ? params.sectionId : "";
	const { currentTenant } = useTenant();
	const router = useRouter();
	const navigation = useNavigation();
	const [content, setContent] = useState<string>("");
	const [title, setTitle] = useState<string>("");
	const queryClient = useQueryClient();

	const wikiSectionQuery = useQuery<WikiSection>({
		queryKey: ["wiki", currentTenant!._id, wikiId, sectionId],
		queryFn: () =>
			getWikiSection({
				tenantId: currentTenant!._id,
				wikiId,
				sectionId,
			}),
		enabled: !!wikiId && !!sectionId && !!currentTenant,
	});

	useLayoutEffect(() => {
		if (wikiSectionQuery.data) {
			setTitle(wikiSectionQuery.data.title);
		}
	}, [wikiSectionQuery.data]);

	const editor = useEditorBridge({
		autofocus: false,
		avoidIosKeyboard: false,
		initialContent: wikiSectionQuery.data?.content || "",
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

	const updateMutation = useMutation({
		mutationFn: updateWikiSection,
		onSuccess: () => {
			NotificationHandler.showSuccess("Änderungen gespeichert");
			queryClient.invalidateQueries({ queryKey: ["wiki", currentTenant!._id, wikiId, sectionId] });
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
					loading={updateMutation.isPending}
					onPress={() =>
						updateMutation.mutate({
							tenantId: currentTenant!._id,
							wikiId,
							sectionId,
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
	}, [navigation, content, title, updateMutation.isPending]);

	if (wikiSectionQuery.isLoading) {
		return <UVCLoader />;
	}

	if (wikiSectionQuery.error) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text
					fs="sm"
					fw="bold"
				>
					Fehler beim Laden des Wiki-Abschnitts
				</Text>
			</Flex>
		);
	}

	if (!wikiSectionQuery.data) {
		return (
			<Flex
				flex={1}
				justify="center"
				align="center"
			>
				<Text
					fs="sm"
					fw="bold"
				>
					Wiki-Abschnitt nicht gefunden
				</Text>
			</Flex>
		);
	}

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
