const { withEntitlementsPlist } = require("expo/config-plugins");

/**
 * Removes `aps-environment` so Xcode can sign with a Personal Team / wildcard
 * profile (no Push capability). This plugin must be registered *before*
 * `expo-notifications` in app.config.js so it runs after notifications in the
 * entitlements mod chain (otherwise notifications re-adds the key).
 *
 * Set EXPO_KEEP_IOS_PUSH=true (e.g. on EAS) when your profile includes Push.
 */
function withStripIosPushEntitlement(config) {
	return withEntitlementsPlist(config, (config) => {
		delete config.modResults["aps-environment"];
		return config;
	});
}

module.exports = withStripIosPushEntitlement;
