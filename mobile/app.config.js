/**
 * Dynamic Expo config on top of app.json.
 * Keeps the iOS push entitlement that expo-notifications adds.
 * Set EXPO_STRIP_IOS_PUSH=true to remove aps-environment for a Personal Team
 * profile that cannot sign Push.
 */
module.exports = ({ config }) => {
	const stripPush =
		process.env.EXPO_STRIP_IOS_PUSH === "true" ||
		process.env.EXPO_STRIP_IOS_PUSH === "1";

	const plugins = [];
	for (const p of config.plugins ?? []) {
		const isNotifications =
			p === "expo-notifications" ||
			(Array.isArray(p) && p[0] === "expo-notifications");
		// Register strip *before* expo-notifications so it runs *after* it in the
		// entitlements mod chain (otherwise notifications re-adds aps-environment).
		if (stripPush && isNotifications) {
			plugins.push("./plugins/withStripIosPushEntitlement");
		}
		plugins.push(p);
	}

	return {
		...config,
		plugins,
	};
};
