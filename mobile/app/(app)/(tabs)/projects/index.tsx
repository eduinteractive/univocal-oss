import { getProjectPlanning, getProjects } from "@/api/Project";
import { IconPlus } from "@/assets/icons/Icon";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import ProjectPlanningSummary from "@/components/features/projects/ProjectPlanningSummary";
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

	const planning = planningQuery.data;

	return (
        <Box flex={1}>
            <UVCMetaCards
                permissionPrefix="projects"
                data={projectsQuery.data || []}
                onOpen={(projectId) =>
                    router.navigate(`/projects/${projectId}` as RelativePathString)
                }
				FlatListProps={{
					ListHeaderComponent:
						planning && planning.totals.projects > 0 ? (
							<ProjectPlanningSummary
								planning={planning}
								onOpen={(projectId) =>
									router.navigate(`/projects/${projectId}` as RelativePathString)
								}
							/>
						) : null,
				}}
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