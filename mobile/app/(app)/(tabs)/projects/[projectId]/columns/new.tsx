import { useRouter, useLocalSearchParams } from "expo-router";
import { useTenant } from "@/context/TenantContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProject, updateProject } from "@/api/Project";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { Button, Flex, TextInput } from "@eduinteractive/balladui";

export default () => {
	const router = useRouter();
	const { currentTenant } = useTenant();
	const { projectId } = useLocalSearchParams();
	const queryClient = useQueryClient();
	const [title, setTitle] = useState("");
	const [loading, setLoading] = useState(false);

	const projectQuery = useQuery({
		queryKey: ["project", currentTenant?._id, projectId],
		queryFn: () =>
			getProject({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
			}),
		enabled: !!projectId && !!currentTenant,
	});

	const createColumnMutation = useMutation({
		mutationFn: updateProject,
		onSuccess: () => {
			NotificationHandler.showSuccess("Spalte wurde erfolgreich erstellt");
			queryClient.invalidateQueries({
				queryKey: ["project", currentTenant?._id, projectId],
			});
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async () => {
		if (!title.trim()) {
			NotificationHandler.showError("Bitte geben Sie einen Titel ein");
			return;
		}

		if (!projectQuery.data) {
			NotificationHandler.showError("Projekt nicht gefunden");
			return;
		}

		setLoading(true);
		try {
			const newColumn = {
				_id: "", // Backend will generate a new ID
				title: title.trim(),
				tasks: [],
			};

			const updatedColumns = [
				...projectQuery.data.columns.map((col) => ({
					_id: col._id,
					title: col.title,
					tasks: col.tasks.map((task) => task._id),
				})),
				newColumn,
			];

			await createColumnMutation.mutateAsync({
				tenantId: currentTenant!._id,
				projectId: projectId as string,
				body: {
					columns: updatedColumns,
				},
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1, backgroundColor: "white" }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<Flex
					direction="column"
					gap="lg"
					p="md"
				>
					<TextInput
						value={title}
						onChangeText={setTitle}
						placeholder="Titel eingeben..."
						size="sm"
						label="Titel"
						required
						onSubmitEditing={() => Keyboard.dismiss()}
					/>

					<Button
						color="primary"
						onPress={handleSubmit}
						loading={loading}
						disabled={loading || !title.trim()}
					>
						Spalte erstellen
					</Button>
				</Flex>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
