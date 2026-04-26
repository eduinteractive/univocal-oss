import { query } from "express-validator";

export const getTenantStatisticsChain = () => {
    return [
        query('timeSeries').optional().isIn(['daily', 'weekly', 'monthly', 'all']).withMessage('Invalid time series').default('all'),
        query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format'),
        query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format'),
    ]
}
