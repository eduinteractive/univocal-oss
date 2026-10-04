import { BadRequestError } from "@eduinteractive/uvc-common";
import { NextFunction, Request, Response } from "express";
import { TimeSeriesStat } from "../models/TimeSeriesStat";
import { LandingDailyStat } from "../models/LandingDailyStat";
import { isValidMorigin, LandingGranularity, languageFromHeader, parseLandingEvent, utcDay } from "../helper/LandingEvent";
import { claimLandingCount, geoFromAddress, hashClientAddress, readClientAddress } from "../helper/LandingDedupe";
import { incrementCampaign, recordBotHit, recordLandingEvent } from "../helper/LandingIngest";
import { buildLandingSummary } from "../helper/LandingSummary";
import { classifyUserAgent } from "../helper/LandingUserAgent";

export const getLandingPageCampaignStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const morigin = req.query.morigin;
        if (typeof morigin !== "string" || !isValidMorigin(morigin)) {
            throw new BadRequestError("morigin is invalid");
        }

        const stat = await TimeSeriesStat.find({ metric: "landing_page_campaign_" + morigin }).sort({ timestamp: 1 });

        res.status(200).json(
            stat.map((doc) => ({
                _id: doc._id,
                metric: doc.metric,
                timestamp: doc.timestamp,
                value: doc.value,
            }))
        );
    } catch (error) {
        next(error);
    }
};

export const registerLandingPageCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const morigin = req.body && typeof req.body.morigin === "string" ? req.body.morigin : "";
        if (!isValidMorigin(morigin)) {
            throw new BadRequestError("morigin is invalid");
        }

        const counted = await claimLandingCount(readClientAddress(req), `campaign|${morigin}`, utcDay(new Date()));
        if (counted) await incrementCampaign(morigin);

        res.status(200).json({ message: "Success", registered: counted });
    } catch (error) {
        next(error);
    }
};

export const registerLandingEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const event = parseLandingEvent(req.body);
        const agent = classifyUserAgent(req.headers["user-agent"]);
        if (agent.bot) {
            await recordBotHit(event, agent);
            res.status(200).json({ message: "Success", counted: false });
            return;
        }

        const address = readClientAddress(req);
        const now = new Date();
        const geo = geoFromAddress(address);
        const counted = await recordLandingEvent(event, {
            ipHash: hashClientAddress(address),
            day: utcDay(now),
            now,
            agent,
            country: geo.country,
            region: geo.region,
            language: languageFromHeader(req.headers["accept-language"]),
        });

        res.status(200).json({ message: "Success", counted });
    } catch (error) {
        next(error);
    }
};

interface GetLandingSummaryQuery {
    from?: string;
    to?: string;
    granularity?: LandingGranularity;
}

export const getLandingSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { from, to, granularity } = req.query as unknown as GetLandingSummaryQuery;
        if (!from || !to || !granularity) {
            throw new BadRequestError("Date range is invalid");
        }
        if (!["daily", "weekly", "monthly"].includes(granularity)) {
            throw new BadRequestError("Granularity is invalid");
        }

        const start = utcDay(new Date(from));
        const end = utcDay(new Date(to));
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
            throw new BadRequestError("Date range is invalid");
        }
        const span = end.getTime() - start.getTime() + 86400000;
        const previousStart = new Date(start.getTime() - span);

        const allRows = await LandingDailyStat.find({ timestamp: { $gte: previousStart, $lte: end } })
            .select("metric timestamp value dims")
            .lean();

        const rows = allRows.filter((row) => row.timestamp >= start);
        const previousRows = allRows.filter((row) => row.timestamp < start);

        res.status(200).json(buildLandingSummary(rows, previousRows, start, end, granularity));
    } catch (error) {
        next(error);
    }
};
