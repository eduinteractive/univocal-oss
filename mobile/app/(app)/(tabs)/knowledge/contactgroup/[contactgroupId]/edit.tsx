import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getContactGroup, updateContactGroup } from "@/api/Contact";
import { useTenant } from "@/context/TenantContext";
import { useState, useLayoutEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import UVCLoader from "@/components/common/UVCLoader";
import { NotificationHandler } from "@/utils/NotificationHandler";
import UVCMetaForm from "@/components/common/UVCMetaForm";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { contactgroupId } = useLocalSearchParams();
	const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    
	const contactGroupQuery = useQuery({
		queryKey: ["contactGroup", currentTenant?._id, contactgroupId],
		queryFn: () =>
			getContactGroup({
				tenantId: currentTenant!._id,
				contactGroupId: contactgroupId as string,
				params: null,
			}),
		enabled: !!contactgroupId && !!currentTenant,
	});

    useLayoutEffect(() => {
        if (contactGroupQuery.data) {
            navigation.setOptions({
                title: contactGroupQuery.data.contactGroup.title,
            });
        }
    }, [contactGroupQuery.data]);

	const updateMutation = useMutation({
		mutationFn: updateContactGroup,
		onSuccess: () => {
			NotificationHandler.showSuccess("Kontaktgruppe erfolgreich aktualisiert");
			queryClient.invalidateQueries({ queryKey: ["contactGroups", currentTenant!._id, {}] });
			queryClient.invalidateQueries({ queryKey: ["contactGroup", currentTenant!._id, contactgroupId] });
			router.back();
		},
		onError: NotificationHandler.showAxiosError,
	});

	const handleSubmit = async (data: { title: string; description?: string; viewAccess: number }) => {
		setLoading(true);
		try {
			await updateMutation.mutateAsync({
				tenantId: currentTenant!._id,
				contactGroupId: contactgroupId as string,
				body: {
					title: data.title,
					description: data.description,
					viewAccess: data.viewAccess,
				},
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	if (contactGroupQuery.isLoading || !contactGroupQuery.data) {
		return <UVCLoader />;
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
		>
			<UVCMetaForm
				data={contactGroupQuery.data.contactGroup}
				loading={loading}
				onSubmit={handleSubmit}
				config={{
					viewAccess: true,
				}}
			/>
		</KeyboardAvoidingView>
	);
};