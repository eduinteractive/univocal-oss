import HeaderFeature from "@/components/layouts/HeaderFeature";
import { useTenant } from "@/context/TenantContext";
import { Stack } from "expo-router";

export default () => {
    const { currentTenant } = useTenant();

	return (
		<Stack>
            <Stack.Screen
				name="index"
				options={{
					title: currentTenant?.tenant?.title,
                    header: () => <HeaderFeature title={currentTenant?.tenant?.title || "Dashboard"} disableNavigation={true} />,
				}}
			/>
		</Stack>
	);
};
