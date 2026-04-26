/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Dev: Browser hits marketing host (e.g. ingress → univocal.local.de) while Next serves on :3010.
	// Without this, Next warns on cross-origin fetches to /_next/* (see allowedDevOrigins in Next 15+).
	allowedDevOrigins: [
		"http://univocal.local.de",
		"https://univocal.local.de",
		"http://localhost:3010",
		"http://127.0.0.1:3010",
	],
	experimental: {
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
	},
	output: "standalone",
};

export default nextConfig;
