"use client";

import { useId } from "react";
import { Box } from "@mantine/core";
import { COLORS } from "../constants/Colors";

const P = COLORS.PRIMARY;
/** Neutral wash, dezent, fast weiß */
const N = "#94a3b8";

/** Hub-and-spoke network, Vernetzung / Zusammenarbeit (ohne Karten-Rahmen) */
export function UVCNetworkCollaborationSvg() {
	return (
		<Box
			component="figure"
			maw={280}
			mx="auto"
			style={{ flexShrink: 0 }}
			aria-hidden
		>
			<svg
				viewBox="0 0 220 200"
				width="100%"
				height="auto"
				xmlns="http://www.w3.org/2000/svg"
			>
				{/* edges */}
				<g stroke={P} strokeOpacity={0.11} strokeWidth={1.75} strokeLinecap="round">
					<line x1="110" y1="100" x2="110" y2="38" />
					<line x1="110" y1="100" x2="175" y2="72" />
					<line x1="110" y1="100" x2="175" y2="128" />
					<line x1="110" y1="100" x2="45" y2="72" />
					<line x1="110" y1="100" x2="45" y2="128" />
				</g>
				{/* outer nodes */}
				{[
					[110, 38],
					[175, 72],
					[175, 128],
					[45, 72],
					[45, 128],
				].map(([cx, cy], i) => (
					<g key={i}>
						<circle cx={cx} cy={cy} r={14} fill={P} fillOpacity={0.05} />
						<circle cx={cx} cy={cy} r={7} fill={P} fillOpacity={0.22} />
					</g>
				))}
				{/* center hub */}
				<circle cx="110" cy="100" r={22} fill={P} fillOpacity={0.07} />
				<circle cx="110" cy="100" r={12} fill={P} fillOpacity={0.28} />
			</svg>
		</Box>
	);
}

/** Full-bleed soft washes + blobs for „Was ist univocal“ section */
export function UVCAmbientBlobs() {
	const bid = useId().replace(/:/g, "");
	return (
		<Box
			component="span"
			style={{
				position: "absolute",
				inset: 0,
				pointerEvents: "none",
				overflow: "hidden",
			}}
			aria-hidden
		>
			<svg
				width="100%"
				height="100%"
				style={{ position: "absolute", inset: 0, display: "block" }}
				preserveAspectRatio="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient id={`uvc-wash-${bid}`} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor={N} stopOpacity={0.045} />
						<stop offset="48%" stopColor="#ffffff" stopOpacity={0} />
						<stop offset="100%" stopColor={N} stopOpacity={0.03} />
					</linearGradient>
					<radialGradient id={`uvc-accent-tr-${bid}`} cx="92%" cy="8%" r="55%">
						<stop offset="0%" stopColor={P} stopOpacity={0.07} />
						<stop offset="100%" stopColor={P} stopOpacity={0} />
					</radialGradient>
				</defs>
				<rect width="100%" height="100%" fill={`url(#uvc-wash-${bid})`} />
				<rect width="100%" height="100%" fill={`url(#uvc-accent-tr-${bid})`} />
				<ellipse cx="12%" cy="88%" rx="28%" ry="24%" fill={N} fillOpacity={0.04} />
			</svg>
		</Box>
	);
}

/** Subtle dot grid behind option cards */
export function UVCCtaDotPattern() {
	const pid = useId().replace(/:/g, "");
	return (
		<Box
			component="span"
			style={{
				position: "absolute",
				inset: 0,
				pointerEvents: "none",
				opacity: 0.28,
				borderRadius: "inherit",
			}}
			aria-hidden
		>
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern
						id={`uvc-dots-${pid}`}
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1" fill={P} fillOpacity={0.06} />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill={`url(#uvc-dots-${pid})`} />
			</svg>
		</Box>
	);
}
