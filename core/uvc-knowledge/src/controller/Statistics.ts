import { NextFunction, Request, Response } from "express";
import Contact from "../models/Contact";
import Wiki from "../models/Wiki";

interface TimeSeriesData {
    date: string;
    count: number;
}

interface getKnowledgeStatisticsQuery {
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


export const getKnowledgeStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as getKnowledgeStatisticsQuery;
        const timeSeriesParam = query.timeSeries || 'all';

        // 1. Count of contacts and wikis
        const totalContacts = await Contact.countDocuments();
        const totalWikis = await Wiki.countDocuments();

        // 2. Contacts in time series (daily, weekly, monthly) based on createdAt
        // Contact model now has timestamps: true, so it has createdAt
        const contacts: {
            daily?: TimeSeriesData[];
            weekly?: TimeSeriesData[];
            monthly?: TimeSeriesData[];
        } = {};

        if (timeSeriesParam === 'daily' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo, 'createdAt');
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
            contacts.daily = await Contact.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'weekly' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo, 'createdAt');
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
            contacts.weekly = await Contact.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'monthly' || timeSeriesParam === 'all') {
            const pipeline: any[] = [];
            const matchStage = createDateMatchStage(query.dateFrom, query.dateTo, 'createdAt');
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
            contacts.monthly = await Contact.aggregate<TimeSeriesData>(pipeline);
        }

        // 3. Wikis in time series (daily, weekly, monthly) based on createdAt
        // Wiki extends SVHMetadataDoc, so it has createdAt
        const wikis: {
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
            wikis.daily = await Wiki.aggregate<TimeSeriesData>(pipeline);
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
            wikis.weekly = await Wiki.aggregate<TimeSeriesData>(pipeline);
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
            wikis.monthly = await Wiki.aggregate<TimeSeriesData>(pipeline);
        }

        res.status(200).json({
            totalContacts,
            totalWikis,
            contacts,
            wikis
        });
    } catch (err) {
        next(err);
    }
}
