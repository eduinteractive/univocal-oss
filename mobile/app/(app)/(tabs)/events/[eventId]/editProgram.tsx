import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvent, updateEvent } from "@/api/Events";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { RichText, useEditorBridge, Toolbar, PlaceholderBridge, TenTapStartKit } from "@10play/tentap-editor";
import { KeyboardAvoidingView, Platform } from "react-native";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { applyColor, Box, Button, Flex, Text } from "@eduinteractive/balladui";
import { IconCheck } from "@/assets/icons/Icon";

export default function EditProgram() {
	const params = useLocalSearchParams();
	const eventId = typeof params.eventId === "string" ? params.eventId : "";
	const { currentTenant } = useTenant();
	const router = useRouter();
	const navigation = useNavigation();
	const [content, setContent] = useState<string>("");
	const [materials, setMaterials] = useState<{ title: string; link: string; mimetype: string }[]>([]);
	const queryClient = useQueryClient();

	const eventQuery = useQuery({
		queryKey: ["event", currentTenant?._id, eventId],
		queryFn: () =>
			getEvent({
				tenantId: currentTenant!._id,
				eventId,
			}),
		enabled: !!eventId && !!currentTenant,
	});

	useLayoutEffect(() => {
		if (eventQuery.data) {
			setContent(eventQuery.data.event.config.toc.content || "");
			setMaterials(eventQuery.data.event.config.toc.materials || []);
		}
	}, [eventQuery.data]);

	const editor = useEditorBridge({
		autofocus: false,
		avoidIosKeyboard: false,
		initialContent: eventQuery.data?.event.config.toc.content || "",
		bridgeExtensions: [
			...TenTapStartKit,
			PlaceholderBridge.configureExtension({
				placeholder: "Programm-Inhalt einfügen...",
			}),
		],
		onChange: () => {
			if (editor) {
				editor.getHTML().then((html) => setContent(html));
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateEvent,
		onSuccess: () => {
			NotificationHandler.showSuccess("Programm gespeichert");
			queryClient.invalidateQueries({ queryKey: ["event", currentTenant!._id, eventId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Programm bearbeiten",
			headerRight: () => (
				<Button
					variant="subtle"
					size="sm"
					loading={updateMutation.isPending}
					onPress={() =>
						updateMutation.mutate({
							tenantId: currentTenant!._id,
							eventId,
							body: {
								config: {
									toc: {
										enabled:
											eventQuery.data?.event.config
												.toc.enabled || true,
										content,
										materials,
									},
								},
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
	}, [navigation, content, materials, updateMutation.isPending, eventQuery.data]);

	if (eventQuery.isLoading) {
		return <UVCLoader />;
	}

	if (eventQuery.error) {
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
					Fehler beim Laden des Events
				</Text>
			</Flex>
		);
	}

	if (!eventQuery.data) {
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
					Event nicht gefunden
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
}
