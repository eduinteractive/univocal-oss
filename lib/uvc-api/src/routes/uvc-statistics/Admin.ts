import { APIHandler } from "../base";
import { LandingCampaignStat, LandingGranularity, LandingSummary } from "./Types";

/**
 * Landing Page Analytics
 */

interface getLandingCampaignStatisticsRequest {
    query: {
        morigin: string;
    }
}

export const getLandingCampaignStatistics = async (req: getLandingCampaignStatisticsRequest) => {
    const response = await APIHandler.get("/statistics/admin/platform/landing", { params: req.query });
    return response.data as LandingCampaignStat[];
}

export interface getLandingSummaryRequest {
    query: {
        from: string;
        to: string;
        granularity: LandingGranularity;
    }
}

export const getLandingSummary = async (req: getLandingSummaryRequest) => {
    const response = await APIHandler.get("/statistics/admin/platform/landing/summary", { params: req.query });
    return response.data as LandingSummary;
}
