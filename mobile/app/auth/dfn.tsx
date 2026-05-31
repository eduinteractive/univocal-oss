import { useEffect } from "react";
import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Fallback route for cold-start deep links from the DFN/Shibboleth callback.
 * The primary flow is handled inline by `WebBrowser.openAuthSessionAsync`.
 */
const DfnAuthCallback = () => {
	useEffect(() => {
		router.replace("/auth");
	}, []);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator />
		</View>
	);
};

export default DfnAuthCallback;
