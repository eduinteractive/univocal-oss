import { getEvents } from "@/api/Events";
import { IconPlus } from "@/assets/icons/Icon";
import UVCMetaCards from "@/components/common/UVCMetaCards";
import { useTenant } from "@/context/TenantContext";
import { Box, Flex, FAB, Text } from "@eduinteractive/balladui";
import { useQuery } from "@tanstack/react-query";
import { RelativePathString, useRouter } from "expo-router";

export default () => {
	const { currentTenant } = useTenant();
	const router = useRouter();

	const eventsQuery = useQuery({
		queryKey: ["events", currentTenant?._id, {}],
		queryFn: () =>
			getEvents({
				tenantId: currentTenant!._id,
				params: null,
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return (
		<Box flex={1}>
			<UVCMetaCards
				permissionPrefix="events"
				data={eventsQuery.data || []}
				onOpen={(eventId) => router.navigate(`/events/${eventId}` as RelativePathString)}
			/>
			<FAB
				p="smd"
				px="md"
				color="dark"
				onPress={() => router.navigate("/events/new" as RelativePathString)}
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
						Neue Veranstaltung
					</Text>
				</Flex>
			</FAB>
		</Box>
	);
};
