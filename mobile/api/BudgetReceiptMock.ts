import { BudgetReceipt } from "./Budget";

/**
 * In-memory mock for budget receipt routes until prod backend is ready.
 * Set to false once the real API is deployed.
 */
export const MOCK_BUDGET_RECEIPTS = true;

type MockBudgetFlags = {
	ist_active?: boolean;
	receipt_active?: boolean;
};

const receiptsByBudget = new Map<string, BudgetReceipt[]>();
const budgetFlags = new Map<string, MockBudgetFlags>();

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const makeId = () =>
	`mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

export const getMockBudgetFlags = (budgetId: string): MockBudgetFlags | undefined => {
	return budgetFlags.get(budgetId);
};

export const setMockBudgetFlags = (
	budgetId: string,
	flags: MockBudgetFlags
): MockBudgetFlags => {
	const next = { ...budgetFlags.get(budgetId), ...flags };
	budgetFlags.set(budgetId, next);
	return next;
};

export const mockGetBudgetReceipts = async (
	budgetId: string
): Promise<BudgetReceipt[]> => {
	await delay();
	return [...(receiptsByBudget.get(budgetId) || [])];
};

export const mockCreateBudgetReceipt = async (
	budgetId: string,
	body: {
		positionId?: string;
		amount: number;
		description?: string;
		date: string | Date;
		newFile?: { uri: string; name: string; type: string };
	}
): Promise<BudgetReceipt> => {
	await delay();
	const now = new Date();
	const receipt: BudgetReceipt = {
		_id: makeId(),
		positionId: body.positionId || "",
		amount: Math.round(body.amount * 100) / 100,
		description: body.description,
		date: typeof body.date === "string" ? new Date(body.date) : body.date,
		file: body.newFile
			? {
					title: body.newFile.name,
					link: body.newFile.uri,
					mimetype: body.newFile.type,
				}
			: null,
		createdAt: now,
		updatedAt: now,
	};

	const list = receiptsByBudget.get(budgetId) || [];
	list.push(receipt);
	receiptsByBudget.set(budgetId, list);
	return receipt;
};

export const mockUpdateBudgetReceipt = async (
	budgetId: string,
	receiptId: string,
	body: {
		positionId: string;
		amount?: number;
		description?: string;
		date?: string | Date;
		file?: { title: string; link: string; mimetype: string };
		newFile?: { uri: string; name: string; type: string };
	}
): Promise<BudgetReceipt> => {
	await delay();
	const list = receiptsByBudget.get(budgetId) || [];
	const index = list.findIndex((r) => r._id === receiptId);
	if (index === -1) {
		throw new Error("Beleg nicht gefunden");
	}

	const current = list[index];
	const updated: BudgetReceipt = {
		...current,
		positionId: body.positionId,
		amount:
			body.amount !== undefined
				? Math.round(body.amount * 100) / 100
				: current.amount,
		description:
			body.description !== undefined ? body.description : current.description,
		date:
			body.date !== undefined
				? typeof body.date === "string"
					? new Date(body.date)
					: body.date
				: current.date,
		file: body.newFile
			? {
					title: body.newFile.name,
					link: body.newFile.uri,
					mimetype: body.newFile.type,
				}
			: body.file !== undefined
				? body.file
				: current.file,
		updatedAt: new Date(),
	};

	list[index] = updated;
	receiptsByBudget.set(budgetId, list);
	return updated;
};

export const mockDeleteBudgetReceipt = async (
	budgetId: string,
	receiptId: string
): Promise<void> => {
	await delay();
	const list = receiptsByBudget.get(budgetId) || [];
	receiptsByBudget.set(
		budgetId,
		list.filter((r) => r._id !== receiptId)
	);
};
