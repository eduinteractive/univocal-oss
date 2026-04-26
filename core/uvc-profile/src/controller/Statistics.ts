import { NextFunction, Request, Response } from "express";
import News from "../models/News";
import Project from "../models/Project";

interface TimeSeriesData {
    date: string;
    count: number;
}

interface getProfileStatisticsQuery {
    timeSeries?: 'daily' | 'weekly' | 'monthly' | 'all';
    dateFrom?: string;
    dateTo?: string;
}

// Helper to create date match stage for MongoDB aggregation
const createDateMatchStage = (dateFrom?: string, dateTo?: string, dateField: string = 'createdAt'): any => {
    const matchStage: any = {};
    if (dateFrom || dateTo) {
        matchStage[dateField] = {};
        if (dateFrom) {
            matchStage[dateField].$gte = new Date(dateFrom);
        }
        if (dateTo) {
            const dateToObj = new Date(dateTo);
            dateToObj.setHours(23, 59, 59, 999);
            matchStage[dateField].$lte = dateToObj;
        }
    }
    return Object.keys(matchStage).length > 0 ? { $match: matchStage } : null;
};

export const getProfileStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as getProfileStatisticsQuery;
        const timeSeriesParam = query.timeSeries || 'all';

        // 1. Count of news and projects
        const totalNews = await News.countDocuments();
        const totalProjects = await Project.countDocuments();

        // 2. News in time series (daily, weekly, monthly) based on createdAt
        // News model has timestamps: true, so it has createdAt
        const news: {
            daily?: TimeSeriesData[];
            weekly?: TimeSeriesData[];
            monthly?: TimeSeriesData[];
        } = {};

        if (timeSeriesParam === 'daily' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo);
            if (matchStage) pipeline.push(matchStage);
            pipeline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        count: 1
                    }
                }
            );
            news.daily = await News.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'weekly' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo);
            if (matchStage) pipeline.push(matchStage);
            pipeline.push(
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            week: { $week: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.week": 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: {
                            $concat: [
                                { $toString: "$_id.year" },
                                "-W",
                                { $toString: "$_id.week" }
                            ]
                        },
                        count: 1
                    }
                }
            );
            news.weekly = await News.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'monthly' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo);
            if (matchStage) pipeline.push(matchStage);
            pipeline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        count: 1
                    }
                }
            );
            news.monthly = await News.aggregate<TimeSeriesData>(pipeline);
        }

        // 3. Projects in time series (daily, weekly, monthly) based on createdAt
        // Project model has timestamps: true, so it has createdAt
        const projects: {
            daily?: TimeSeriesData[];
            weekly?: TimeSeriesData[];
            monthly?: TimeSeriesData[];
        } = {};

        if (timeSeriesParam === 'daily' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo);
            if (matchStage) pipeline.push(matchStage);
            pipeline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        count: 1
                    }
                }
            );
            projects.daily = await Project.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'weekly' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo);
            if (matchStage) pipeline.push(matchStage);
            pipeline.push(
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            week: { $week: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.week": 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: {
                            $concat: [
                                { $toString: "$_id.year" },
                                "-W",
                                { $toString: "$_id.week" }
                            ]
                        },
                        count: 1
                    }
                }
            );
            projects.weekly = await Project.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'monthly' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo);
            if (matchStage) pipeline.push(matchStage);
            pipeline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        count: 1
                    }
                }
            );
            projects.monthly = await Project.aggregate<TimeSeriesData>(pipeline);
        }

        res.status(200).json({
            totalNews,
            totalProjects,
            news,
            projects
        });
    } catch (err) {
        next(err);
    }
}
