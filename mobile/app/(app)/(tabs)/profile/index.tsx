import { useQuery } from "@tanstack/react-query";
import { getProfilePages, getSitePreview } from "@/api/Profile";
import { useTenant } from "@/context/TenantContext";
import UVCLoader from "@/components/common/UVCLoader";
import SiteProfileViewer from "@/components/features/profile/SiteProfileViewer";
import { Flex, Text } from "@eduinteractive/balladui";

const ProfileScreen = () => {
	const { currentTenant } = useTenant();
	const tenantId = currentTenant?.tenant?._id;

	const siteQuery = useQuery({
		queryKey: ["site-preview", tenantId],
		queryFn: () => getSitePreview(tenantId),
		enabled: !!tenantId,
	});

	const pagesQuery = useQuery({
		queryKey: ["site-pages", tenantId],
		queryFn: () => getProfilePages(tenantId),
		enabled: !!tenantId,
	});

	if (!tenantId || siteQuery.isLoading || pagesQuery.isLoading) {
		return <UVCLoader />;
	}

	if (siteQuery.isError || !siteQuery.data) {
		return (
			<Flex
				flex={1}
				align="center"
				justify="center"
				p="md"
			>
				<Text fs="sm">Das Gruppenprofil konnte nicht geladen werden.</Text>
			</Flex>
		);
	}

	const pages = (pagesQuery.data ?? [])
		.filter((page) => page.status === "PUBLISHED")
		.map((page) => ({
			_id: page._id,
			title: page.title,
			slug: page.slug,
			content: page.content,
		}));

	return (
		<SiteProfileViewer
			site={siteQuery.data}
			pages={pages}
		/>
	);
};

export default ProfileScreen;
