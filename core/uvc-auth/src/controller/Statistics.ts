import { Request, Response, NextFunction } from "express";
import UserAccount from "../models/UserAccount";
import { NetworkAxios } from "@eduinteractive/uvc-common";

interface TimeSeriesData {
    date: string;
    count: number;
}

interface GroupStatistics {
    tenantId: string;
    tenantTitle: string;
    userCount: number;
}

interface getAuthStatisticsQuery {
    timeSeries?: 'daily' | 'weekly' | 'monthly' | 'all';
    dateFrom?: string;
    dateTo?: string;
}

export const getAuthStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query as getAuthStatisticsQuery;
        const timeSeriesParam = query.timeSeries || 'all';

        // 1. Count of users
        const totalUsers = await UserAccount.countDocuments();

        // 2. New registrations in time series (daily, weekly, monthly)
        // Only fetch the requested time series
        const registrations: {
            daily?: TimeSeriesData[];
            weekly?: TimeSeriesData[];
            monthly?: TimeSeriesData[];
        } = {};

        if (timeSeriesParam === 'daily' || timeSeriesParam === 'all') {
            const matchStage: any = {};
            if (query.dateFrom || query.dateTo) {
                matchStage.registerDate = {};
                if (query.dateFrom) {
                    matchStage.registerDate.$gte = new Date(query.dateFrom);
                }
                if (query.dateTo) {
                    const dateTo = new Date(query.dateTo);
                    dateTo.setHours(23, 59, 59, 999); // Include the entire day
                    matchStage.registerDate.$lte = dateTo;
                }
            }
            
            const pipeline: any[] = [];
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
            pipeline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$registerDate"
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
            
            registrations.daily = await UserAccount.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'weekly' || timeSeriesParam === 'all') {
            const matchStage: any = {};
            if (query.dateFrom || query.dateTo) {
                matchStage.registerDate = {};
                if (query.dateFrom) {
                    matchStage.registerDate.$gte = new Date(query.dateFrom);
                }
                if (query.dateTo) {
                    const dateTo = new Date(query.dateTo);
                    dateTo.setHours(23, 59, 59, 999);
                    matchStage.registerDate.$lte = dateTo;
                }
            }
            
            const pipeline: any[] = [];
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
            pipeline.push(
                {
                    $group: {
                        _id: {
                            year: { $year: "$registerDate" },
                            week: { $week: "$registerDate" }
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
            
            registrations.weekly = await UserAccount.aggregate<TimeSeriesData>(pipeline);
        }

        if (timeSeriesParam === 'monthly' || timeSeriesParam === 'all') {
            const matchStage: any = {};
            if (query.dateFrom || query.dateTo) {
                matchStage.registerDate = {};
                if (query.dateFrom) {
                    matchStage.registerDate.$gte = new Date(query.dateFrom);
                }
                if (query.dateTo) {
                    const dateTo = new Date(query.dateTo);
                    dateTo.setHours(23, 59, 59, 999);
                    matchStage.registerDate.$lte = dateTo;
                }
            }
            
            const pipeline: any[] = [];
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
            pipeline.push(
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$registerDate"
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
            
            registrations.monthly = await UserAccount.aggregate<TimeSeriesData>(pipeline);
        }

        // 3. Count of groups (how many users are in which group)
        // First, get all tenants from the tenant service
        let tenants: any[] = [];
        try {
            const tenantsResponse = await NetworkAxios.get('http://uvc-tenant-srv:3002/api/tenant/public/tenant');
            tenants = tenantsResponse.data || [];
        } catch (error) {
            console.warn('Failed to fetch tenants for statistics:', error);
            tenants = [];
        }

        // Get all users with their groups
        const users = await UserAccount.find({}, { groups: 1 }).lean();

        // Count users per group
        const groupCounts: Map<string, number> = new Map();
        const tenantMap: Map<string, { title: string }> = new Map();

        // Create a map of tenant IDs to tenant titles
        tenants.forEach((tenant: any) => {
            tenantMap.set(tenant._id?.toString() || tenant.id?.toString(), {
                title: tenant.title || 'Unknown'
            });
        });

        // Count users per group
        users.forEach((user: any) => {
            if (user.groups && Array.isArray(user.groups)) {
                user.groups.forEach((group: any) => {
                    const groupId = group._id?.toString() || group.id?.toString();
                    if (groupId) {
                        const currentCount = groupCounts.get(groupId) || 0;
                        groupCounts.set(groupId, currentCount + 1);
                    }
                });
            }
        });

        // Build group statistics array
        const groupStatistics: GroupStatistics[] = Array.from(groupCounts.entries()).map(([tenantId, userCount]) => {
            const tenant = tenantMap.get(tenantId);
            return {
                tenantId,
                tenantTitle: tenant?.title || 'Unknown Tenant',
                userCount
            };
        });

        // Sort by user count (descending)
        groupStatistics.sort((a, b) => b.userCount - a.userCount);

        res.status(200).json({
            totalUsers,
            registrations,
            groupStatistics
        });
    } catch (err) {
        next(err);
    }
}