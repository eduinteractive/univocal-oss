import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/api/Profile";
import { deleteTenantProject, getTenantProjects } from "@/api/TenantProject";
import { deleteNews, getAllNews } from "@/api/News";
import { useTenant } from "@/context/TenantContext";
import SVHLoader from "@/components/common/SVHLoader";
import { useLayoutEffect, useMemo } from "react";
import { applyColor, applySizeProp, Button, Tabs } from "@eduinteractive/balladui";
import ProfileGeneral from "@/components/features/profile/ProfileGeneral";
import ProfileProjects from "@/components/features/profile/ProfileProjects";
import ProfileNews from "@/components/features/profile/ProfileNews";
import { useNavigation } from "expo-router";
import { router } from "expo-router";
import { NotificationHandler } from "@/utils/NotificationHandler";
import { IconEdit } from "@/assets/icons/Icon";

const ProfileScreen = () => {
	const queryClient = useQueryClient();
	const navigation = useNavigation();
	const { currentTenant } = useTenant();

	const profileQuery = useQuery({
		queryKey: ["profile", currentTenant?.tenant!._id],
		queryFn: () => getProfile(currentTenant!.tenant!._id),
	});

	const newsQuery = useQuery({
		queryKey: ["news", currentTenant?.tenant!._id],
		queryFn: () =>
			getAllNews({
				tenantId: currentTenant!.tenant!._id,
				params: null,
			}),
	});

	const projectsQuery = useQuery({
		queryKey: ["projects", currentTenant?.tenant!._id],
		queryFn: () =>
			getTenantProjects({
				tenantId: currentTenant!.tenant!._id,
				params: null,
			}),
	});

	const deleteProjectMutation = useMutation({
		mutationFn: deleteTenantProject,
		onSuccess: () => {
			NotificationHandler.showSuccess("Projekt erfolgreich gelöscht");
			queryClient.invalidateQueries({ queryKey: ["profile", currentTenant?.tenant!._id] });
		},
		onError: () => {
			NotificationHandler.showError("Fehler beim Löschen des Projekts");
		},
	});

	const deleteNewsMutation = useMutation({
		mutationFn: deleteNews,
		onSuccess: () => {
			NotificationHandler.showSuccess("Neuigkeit erfolgreich gelöscht");
			queryClient.invalidateQueries({ queryKey: ["profile", currentTenant?.tenant!._id] });
		},
		onError: () => {
			NotificationHandler.showError("Fehler beim Löschen der Neuigkeit");
		},
	});

    const handleOpenProject = (projectId: string) => {
		router.push(`/profile/project/${projectId}`);
	};

	const handleDeleteProject = (projectId: string) => {
		if (!currentTenant?.tenant?._id) return;

		deleteProjectMutation.mutate({
			tenantId: currentTenant.tenant._id,
			projectId: projectId,
		});
	};

	const handleOpenNews = (newsId: string) => {
		router.push(`/profile/news/${newsId}`);
	};

	const handleDeleteNews = (newsId: string) => {
		if (!currentTenant?.tenant?._id) return;

		deleteNewsMutation.mutate({
			tenantId: currentTenant.tenant._id,
			newsId: newsId,
		});
	};

    const tabs = useMemo(
		() => [
			{
				value: "profile",
				label: "Unser Profil",
				component: <ProfileGeneral data={profileQuery.data} />,
			},
			{
				value: "projects",
				label: "Projekte",
				component: (
					<ProfileProjects
						data={{ projects: projectsQuery.data || [] }}
						onOpenProject={handleOpenProject}
						onDeleteProject={handleDeleteProject}
					/>
				),
			},
			{
				value: "news",
				label: "Neuigkeiten",
				component: (
					<ProfileNews
						data={{ news: newsQuery.data || [] }}
						onOpenNews={handleOpenNews}
						onDeleteNews={handleDeleteNews}
					/>
				),
			},
		],
		[profileQuery.data, projectsQuery.data, newsQuery.data, handleOpenProject, handleDeleteProject, handleOpenNews, handleDeleteNews]
	);

	if (profileQuery.isLoading) {
		return <SVHLoader />;
	}

	return (
		<Tabs
			styles={{ tabContainer: { backgroundColor: "white", paddingTop: applySizeProp("sm") } }}
			tabs={tabs}
			initialValue={"profile"}
		/>
	);
};

export default ProfileScreen;
