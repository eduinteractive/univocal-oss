/**
 * Dynamic Expo config on top of app.json.
 * Strips iOS push entitlement unless EXPO_KEEP_IOS_PUSH is true (Apple Developer
 * provisioning with Push, or EAS credentials that include it).
 */
module.exports = ({ config }) => {
	const keepPush =
		process.env.EXPO_KEEP_IOS_PUSH === "true" ||
		process.env.EXPO_KEEP_IOS_PUSH === "1";

	const plugins = [];
	for (const p of config.plugins ?? []) {
		const isNotifications =
			p === "expo-notifications" ||
			(Array.isArray(p) && p[0] === "expo-notifications");
		// Register strip *before* expo-notifications so it runs *after* it in the
		// entitlements mod chain (otherwise notifications re-adds aps-environment).
		if (!keepPush && isNotifications) {
			plugins.push("./plugins/withStripIosPushEntitlement");
		}
		plugins.push(p);
	}

	return {
		...config,
		plugins,
	};
};
