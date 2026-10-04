import crypto from "crypto";
import geoip from "geoip-lite";
import { Request } from "express";
import { LandingIpHash } from "../models/LandingIpHash";

const HASH_PEPPER = "uvc-landing-ip-v1";

export const readClientAddress = (req: Request) => {
	const forwarded = req.headers["x-forwarded-for"];
	const raw = forwarded
		? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0]).trim()
		: req.socket.remoteAddress || "";
	return raw.replace(/^::ffff:/, "").slice(0, 64);
};

export const hashClientAddress = (address: string) =>
	crypto.createHmac("sha256", HASH_PEPPER).update(address).digest("hex");

export const geoFromAddress = (address: string) => {
	if (!address || address === "unknown") return { country: "unknown", region: "unknown" };
	const geo = geoip.lookup(address);
	const country = geo?.country?.toUpperCase() ?? "";
	if (!/^[A-Z]{2}$/.test(country)) return { country: "unknown", region: "unknown" };
	const region = geo?.region?.toUpperCase() ?? "";
	return {
		country,
		region: /^[A-Z0-9]{1,3}$/.test(region) ? `${country}-${region}` : `${country}-?`,
	};
};

/**
 * Stores a hash of the address for this slot and UTC day.
 * Returns true only the first time. The plain address is not written.
 */
export const claimLandingSlot = async (ipHash: string, slot: string, day: Date) => {
	try {
		await LandingIpHash.create({ day, slot, ipHash });
		return true;
	} catch (error: any) {
		if (error?.code === 11000) return false;
		throw error;
	}
};

export const claimLandingCount = (address: string, slot: string, day: Date) =>
	claimLandingSlot(hashClientAddress(address), slot, day);
