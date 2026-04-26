import Budget from "../models/Budget";

export interface TimeSeriesData {
    date: string;
    count: number;
}

export type TimeSeriesType = 'daily' | 'weekly' | 'monthly' | 'all';

export interface BudgetTimeSeriesResult {
    totalBudgets: number;
    budgets: {
        daily?: TimeSeriesData[];
        weekly?: TimeSeriesData[];
        monthly?: TimeSeriesData[];
    };
}

/**
 * Generates time series statistics for Budgets based on createdAt
 * @param timeSeries - The type of time series to generate ('daily', 'weekly', 'monthly', or 'all')
 * @param dateFrom - Optional start date for filtering (ISO 8601 format)
 * @param dateTo - Optional end date for filtering (ISO 8601 format)
 * @returns Budget time series statistics
 */
export const getBudgetTimeSeries = async (timeSeries: TimeSeriesType = 'all', dateFrom?: string, dateTo?: string): Promise<BudgetTimeSeriesResult> => {
    // Helper to create date match stage for MongoDB aggregation
    const createDateMatchStage = (): any => {
        const matchStage: any = {};
        if (dateFrom || dateTo) {
            matchStage.createdAt = {};
            if (dateFrom) {
                matchStage.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                const dateToObj = new Date(dateTo);
                dateToObj.setHours(23, 59, 59, 999);
                matchStage.createdAt.$lte = dateToObj;
            }
        }
        return Object.keys(matchStage).length > 0 ? { $match: matchStage } : null;
    };
    // 1. Count of budgets
    const totalBudgets = await Budget.countDocuments();

    // 2. Budgets in time series (daily, weekly, monthly) based on createdAt
    // Budget extends SVHMetadataDoc, so it has createdAt
    const budgets: {
        daily?: TimeSeriesData[];
        weekly?: TimeSeriesData[];
        monthly?: TimeSeriesData[];
    } = {};

    if (timeSeries === 'daily' || timeSeries === 'all') {
        const pipeline: any[] = [];
        const matchStage = createDateMatchStage();
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
        budgets.daily = await Budget.aggregate<TimeSeriesData>(pipeline);
    }

    if (timeSeries === 'weekly' || timeSeries === 'all') {
        const pipeline: any[] = [];
        const matchStage = createDateMatchStage();
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
        budgets.weekly = await Budget.aggregate<TimeSeriesData>(pipeline);
    }

    if (timeSeries === 'monthly' || timeSeries === 'all') {
        const pipeline: any[] = [];
        const matchStage = createDateMatchStage();
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
        budgets.monthly = await Budget.aggregate<TimeSeriesData>(pipeline);
    }

    return {
        totalBudgets,
        budgets
    };
}
