import { getBudgets } from "@/api/Budget";
import { IconPlus } from "@/assets/icons/Icon";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import { useTenant } from "@/context/TenantContext";
import { Box, FAB, Flex, Text } from "@eduinteractive/balladui";
import { useQuery } from "@tanstack/react-query";
import { RelativePathString, useRouter } from "expo-router";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();

	const budgetsQuery = useQuery({
		queryKey: ["budgets", currentTenant?._id, {}],
		queryFn: () =>
			getBudgets({
				tenantId: currentTenant!._id,
				params: null,
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return (
		<Box flex={1}>
			<UVCMetaCards
				permissionPrefix="budgets"
				data={budgetsQuery.data || []}
				onOpen={(budgetId) => router.navigate(`/budgets/${budgetId}` as RelativePathString)}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() => router.navigate("/budgets/new" as RelativePathString)}
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
						Neues Budget
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
