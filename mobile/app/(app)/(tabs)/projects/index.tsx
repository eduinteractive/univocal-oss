import { getProjectPlanning, getProjects } from "@/api/Project";
import { IconPlus } from "@/assets/icons/Icon";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import { useTenant } from "@/context/TenantContext";
import { Box, FAB, Flex, Text } from "@eduinteractive/balladui";
import { useQuery } from "@tanstack/react-query";
import { RelativePathString, useRouter } from "expo-router";

export default () => {
	const { currentTenant } = useTenant();
    const router = useRouter();

	const planningQuery = useQuery({
		queryKey: ["projectPlanning", currentTenant?._id],
		queryFn: () => getProjectPlanning({ tenantId: currentTenant!._id }),
		enabled: !!currentTenant?._id,
	});

	const projectsQuery = useQuery({
		queryKey: ["projects", currentTenant?._id, {}],
		queryFn: () =>
			getProjects({
				tenantId: currentTenant!._id,
				params: null,
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const totals = planningQuery.data?.totals;
	const planningProjects = [...(planningQuery.data?.projects || [])].sort((a, b) => {
		if (b.overdue !== a.overdue) return b.overdue - a.overdue;
		if (b.dueSoon !== a.dueSoon) return b.dueSoon - a.dueSoon;
		return a.projectTitle.localeCompare(b.projectTitle, "de");
	});

	return (
        <Box flex={1}>
			{totals && totals.projects > 0 && (
				<Box
					px="sm"
					pt="sm"
				>
					<Text
						fs="md"
						fw="bold"
					>
						Planung
					</Text>
					<Text
						fs="sm"
						c="gray.6"
						mt="xs"
					>
						{totals.open} offen · {totals.done} erledigt · {totals.overdue} überfällig · {totals.dueSoon} bald fällig · {totals.unassigned} ohne Zuweisung
					</Text>
					{planningProjects.map((project) => (
						<Text
							key={project.projectId}
							fs="xs"
							c="gray.6"
							mt="xs"
						>
							{project.projectTitle}: {project.open} offen, {project.done} erledigt, {project.overdue} überfällig, {project.dueSoon} bald fällig, {project.unassigned} ohne Zuweisung
						</Text>
					))}
				</Box>
			)}
            <UVCMetaCards
                permissionPrefix="projects"
                data={projectsQuery.data || []}
                onOpen={(projectId) =>
                    router.navigate(`/projects/${projectId}` as RelativePathString)
                }
            />
            <FAB
                p="smd"
                px="md"
                color="dark"
                onPress={() => router.navigate("/projects/new" as RelativePathString)}
            >
                <Flex
						direction="row"
						align="center"
						gap="sm"
					>
						<IconPlus
							size={18}
							color="white"
						/>
                        <Text
							fs="sm"
							fw="bold"
							c="white"
						>
							Neues Projekt
						</Text>
					</Flex>
            </FAB>
        </Box>
	);
};