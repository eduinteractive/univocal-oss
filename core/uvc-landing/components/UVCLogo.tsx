"use client";
import { Image, useMantineColorScheme } from "@mantine/core";
import { PLACEHOLDER_IMAGE } from "../constants/placeholderImage";
import Link from "next/link";
import { UVC_ASSETS_URL } from "@eduinteractive/uvc-api";

interface UVCLogoProps {
	h?: number;
	variant?: "light" | "dark";
}

const UVCLogo = (props: UVCLogoProps) => {
	const colorScheme = useMantineColorScheme();
	const scheme = colorScheme?.colorScheme ?? "light";

	if (scheme === "dark" || props.variant === "dark") {
		return (
			<Link href="/">
				<Image
					src={UVC_ASSETS_URL + "/logo.png"}
					alt="univocal"
					w="auto"
					height={props.h ? props.h : 35}
                    flex={1}
                    fit="contain"
				/>
			</Link>
		);
	} else {
		return (
			<Link href="/">
				<Image
					src={UVC_ASSETS_URL + "/logo.png"}
					alt="univocal"
					w="auto"
					height={props.h ? props.h : 35}
					fit="contain"
                    flex={1}
				/>
			</Link>
		);
	}
};

export default UVCLogo;
