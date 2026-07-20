import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Fallback route for cold-start deep links from the DFN/Shibboleth callback.
 * The primary flow is handled inline by `WebBrowser.openAuthSessionAsync`.
 */
const DfnAuthCallback = () => {
	const { completeUniversityLogin } = useAuth();
	const { code, status } = useLocalSearchParams<{ code?: string; status?: string }>();
	const handledRef = useRef(false);

	useEffect(() => {
		if (handledRef.current) {
			return;
		}
		handledRef.current = true;

		const run = async () => {
			if (code || status) {
				const success = await completeUniversityLogin({
					code: typeof code === "string" ? code : undefined,
					status: typeof status === "string" ? status : undefined,
				});
				if (!success) {
					router.replace("/auth");
				}
				return;
			}

			router.replace("/auth");
		};

		run();
	}, [code, status, completeUniversityLogin]);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator />
		</View>
	);
};

export default DfnAuthCallback;
