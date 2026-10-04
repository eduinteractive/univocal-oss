import APIHandler, { createUVCMetadataAttrs, getUVCFilterParams, UVCFilterObject, UVCMetadata, updateUVCMetadataAttrs } from './APIHandler';

export interface Budget extends UVCMetadata {
    _id: string;
    category?: string;
    ist_active?: boolean;
    receipt_active?: boolean;
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
    without_assignment?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BudgetReceipt {
    _id: string;
    positionId: string;
    amount: number;
    description?: string;
    date: Date;
    file?: { title: string; link: string; mimetype: string } | null;
    createdAt: Date;
    updatedAt: Date;
}

export type ReceiptFileUpload = {
    uri: string;
    name: string;
    type: string;
};

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
        category?: string;
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
        category?: string;
        ist_active?: boolean;
        receipt_active?: boolean;
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

/**
 * Budget Receipt Routes
 */

interface getBudgetReceiptsRequest {
    tenantId: string;
    budgetId: string;
}

export const getBudgetReceipts = async (req: getBudgetReceiptsRequest): Promise<BudgetReceipt[]> => {
    const response = await APIHandler.get(`/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt`);
    return response.data;
}

interface createBudgetReceiptRequest {
    tenantId: string;
    budgetId: string;
    body: {
        positionId?: string;
        amount: number;
        description?: string;
        date: string | Date;
        newFile?: ReceiptFileUpload;
    }
}

export const createBudgetReceipt = async (req: createBudgetReceiptRequest): Promise<BudgetReceipt> => {
    const formData = new FormData();
    if (req.body.positionId) formData.append("positionId", req.body.positionId);
    formData.append("amount", String(req.body.amount));
    if (req.body.description !== undefined) formData.append("description", req.body.description);
    formData.append(
        "date",
        typeof req.body.date === "string" ? req.body.date : req.body.date.toISOString()
    );
    if (req.body.newFile) {
        formData.append("newFile", {
            uri: req.body.newFile.uri,
            name: req.body.newFile.name,
            type: req.body.newFile.type,
        } as any);
    }

    const response = await APIHandler.post(
        `/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
}

interface updateBudgetReceiptRequest {
    tenantId: string;
    budgetId: string;
    receiptId: string;
    body: {
        positionId: string;
        amount?: number;
        description?: string;
        date?: string | Date;
        file?: { title: string; link: string; mimetype: string };
        newFile?: ReceiptFileUpload;
    }
}

export const updateBudgetReceipt = async (req: updateBudgetReceiptRequest): Promise<BudgetReceipt> => {
    const formData = new FormData();
    formData.append("positionId", req.body.positionId);
    if (req.body.amount !== undefined) formData.append("amount", String(req.body.amount));
    if (req.body.description !== undefined) formData.append("description", req.body.description);
    if (req.body.date !== undefined) {
        formData.append(
            "date",
            typeof req.body.date === "string" ? req.body.date : req.body.date.toISOString()
        );
    }
    if (req.body.newFile) {
        formData.append("newFile", {
            uri: req.body.newFile.uri,
            name: req.body.newFile.name,
            type: req.body.newFile.type,
        } as any);
    }
    if (req.body.file) formData.append("file", JSON.stringify(req.body.file));

    const response = await APIHandler.put(
        `/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt/${req.receiptId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
}

interface deleteBudgetReceiptRequest {
    tenantId: string;
    budgetId: string;
    receiptId: string;
}

export const deleteBudgetReceipt = async (req: deleteBudgetReceiptRequest): Promise<void> => {
    await APIHandler.delete(
        `/tenant/tenant/${req.tenantId}/budget/${req.budgetId}/receipt/${req.receiptId}`
    );
}

export const getBudgetReceiptDownloadUrl = (
    tenantId: string,
    budgetId: string,
    receiptId: string,
    fileLink: string
): string => {
    return `${APIHandler.defaults.baseURL}/tenant/tenant/${tenantId}/budget/${budgetId}/receipt/${receiptId}/download/${encodeURIComponent(fileLink)}`;
};

/** Ist amount for a position: receipt sum when receipt_active, else ist_amount */
export const getPositionIstAmount = (
    position: BudgetPosition,
    receipts: BudgetReceipt[],
    receiptActive?: boolean
): number => {
    if (receiptActive) {
        return receipts
            .filter((r) => r.positionId === position._id)
            .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    }
    return position.ist_amount || 0;
};
