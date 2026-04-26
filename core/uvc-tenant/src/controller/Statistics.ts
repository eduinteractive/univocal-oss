import { NextFunction, Request, Response } from "express";
import { NetworkAxios } from "@eduinteractive/uvc-common";
import { getBudgetTimeSeries, TimeSeriesType } from "../service/Statistics";

interface getTenantStatisticsQuery {
    timeSeries?: TimeSeriesType;
    dateFrom?: string;
    dateTo?: string;
}

export const getTenantStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as getTenantStatisticsQuery;
        const timeSeriesParam = query.timeSeries || 'all';

        // Prepare params for all service calls
        const serviceParams: Record<string, string> = {
            timeSeries: timeSeriesParam
        };
        if (query.dateFrom) serviceParams.dateFrom = query.dateFrom;
        if (query.dateTo) serviceParams.dateTo = query.dateTo;

        // Fetch statistics from all services in parallel
        const [
            calendarStats,
            eventStats,
            knowledgeStats,
            profileStats,
            projectStats,
            surveyStats,
            budgetStats
        ] = await Promise.allSettled([
            // Calendar statistics
            NetworkAxios.get('http://uvc-calendar-srv:3004/api/calendar/network/stats', {
                params: serviceParams
            }),
            // Event statistics
            NetworkAxios.get('http://uvc-event-srv:3008/api/event/network/stats', {
                params: serviceParams
            }),
            // Knowledge statistics
            NetworkAxios.get('http://uvc-knowledge-srv:3006/api/knowledge/network/stats', {
                params: serviceParams
            }),
            // Profile statistics
            NetworkAxios.get('http://uvc-profile-srv:3003/api/profile/network/stats', {
                params: serviceParams
            }),
            // Project statistics
            NetworkAxios.get('http://uvc-project-srv:3009/api/project/network/stats', {
                params: serviceParams
            }),
            // Survey statistics
            NetworkAxios.get('http://uvc-survey-srv:3007/api/survey/network/stats', {
                params: serviceParams
            }),
            // Budget statistics (from local service)
            getBudgetTimeSeries(timeSeriesParam, query.dateFrom, query.dateTo)
        ]);

        // Extract data from settled promises, handling errors gracefully
        const statistics = {
            calendar: calendarStats.status === 'fulfilled' ? calendarStats.value.data : { error: 'Service unavailable' },
            event: eventStats.status === 'fulfilled' ? eventStats.value.data : { error: 'Service unavailable' },
            knowledge: knowledgeStats.status === 'fulfilled' ? knowledgeStats.value.data : { error: 'Service unavailable' },
            profile: profileStats.status === 'fulfilled' ? profileStats.value.data : { error: 'Service unavailable' },
            project: projectStats.status === 'fulfilled' ? projectStats.value.data : { error: 'Service unavailable' },
            survey: surveyStats.status === 'fulfilled' ? surveyStats.value.data : { error: 'Service unavailable' },
            budget: budgetStats.status === 'fulfilled' ? budgetStats.value : { error: 'Service unavailable' }
        };

        res.status(200).json(statistics);
    } catch (err) {
        next(err);
    }
}
