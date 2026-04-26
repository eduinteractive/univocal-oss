import { getProjects } from "@/api/Project";
import { IconPlus } from "@/assets/icons/Icon";
import SVHMetaCards from "@/components/common/SVHMetaCards";
import { useTenant } from "@/context/TenantContext";
import { Box, FAB, Flex, Text } from "@eduinteractive/balladui";
import { useQuery } from "@tanstack/react-query";
import { RelativePathString, useRouter } from "expo-router";

export default () => {
	const { currentTenant } = useTenant();
    const router = useRouter();

	const projectsQuery = useQuery({
		queryKey: ["projects", currentTenant?._id, {}],
		queryFn: () =>
			getProjects({
				tenantId: currentTenant!._id,
				params: null,
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return (
        <Box flex={1}>
            <SVHMetaCards
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