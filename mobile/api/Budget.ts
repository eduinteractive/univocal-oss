import APIHandler, { createUVCMetadataAttrs, getUVCFilterParams, UVCFilterObject, UVCMetadata, updateUVCMetadataAttrs } from './APIHandler';

export interface Budget extends UVCMetadata {
    _id: string;
    year?: number;
    ist_active?: boolean;
}

export enum BudgetPositionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    GROUP_INCOME = 'GROUP_INCOME',
    GROUP_EXPENSE = 'GROUP_EXPENSE',
}

export interface BudgetPosition {
    _id: string;
    budgetId: string;
    next?: string;
    parent?: string;
    title: string;
    description?: string;
    type: BudgetPositionType;
    soll_amount: number;
    ist_amount?: number;
    createdAt: Date;
    updatedAt: Date;
}

interface getBudgetsRequest {
    tenantId: string;
    params: UVCFilterObject | null;
}

export const getBudgets = async (req: getBudgetsRequest): Promise<Budget[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget`, { params: getUVCFilterParams(req.params) });
    return response.data;
}

interface getBudgetRequest {
    tenantId: string;
    budgetId: string;
}

export const getBudget = async (req: getBudgetRequest): Promise<{ budget: Budget, positions: BudgetPosition[] }> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}`);
    return response.data;
}

interface createBudgetRequest {
    tenantId: string;
    body: createUVCMetadataAttrs & {
        year?: number;
    }
}

export const createBudget = async (req: createBudgetRequest): Promise<Budget> => {
    const response = await APIHandler.post(`/tenant/tenant/${req.tenantId}/budget`, req.body);
    return response.data;
}

interface updateBudgetRequest {
    tenantId: string;
    budgetId: string;
    body: updateUVCMetadataAttrs & {
        year?: number;
        ist_active?: boolean;
    }
}

export const updateBudget = async (req: updateBudgetRequest): Promise<Budget> => {
    const response = await APIHandler.put(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}`, req.body);
    return response.data;
}

interface deleteBudgetRequest {
    tenantId: string;
    budgetId: string;
}

export const deleteBudget = async (req: deleteBudgetRequest): Promise<void> => {
    await APIHandler.delete(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}`);
}

interface getBudgetPositionsRequest {
    tenantId: string;
    budgetId: string;
}

export const getBudgetPositions = async (req: getBudgetPositionsRequest): Promise<BudgetPosition[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position`);
    return response.data;
}

interface createBudgetPositionRequest {
    tenantId: string;
    budgetId: string;
    body: {
        title: string;
        description: string;
        type: BudgetPositionType;
        soll_amount: number;
        ist_amount?: number;
        parent?: string;
    }
}

export const createBudgetPosition = async (req: createBudgetPositionRequest): Promise<BudgetPosition> => {
    const response = await APIHandler.post(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position`, req.body);
    return response.data;
}

interface updateBudgetPositionRequest {
    tenantId: string;
    budgetId: string;
    positionId: string;
    body: {
        title: string;
        description: string;
        type: BudgetPositionType;
        soll_amount: number;
        ist_amount?: number;
    }
}

export const updateBudgetPosition = async (req: updateBudgetPositionRequest): Promise<BudgetPosition> => {
    const response = await APIHandler.put(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position/${req.positionId}`, req.body);
    return response.data;
}

interface deleteBudgetPositionRequest {
    tenantId: string;
    budgetId: string;
    positionId: string;
}

export const deleteBudgetPosition = async (req: deleteBudgetPositionRequest): Promise<void> => {
    await APIHandler.delete(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/position/${req.positionId}`);
}