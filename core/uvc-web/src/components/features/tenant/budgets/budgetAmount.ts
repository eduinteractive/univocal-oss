export const parseBudgetAmount = (
    value: number | string | null | undefined
): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value !== 'string') return 0;

    const cleaned = value.replace(/[^\d,.-]/g, '');
    if (!cleaned || cleaned === '-' || cleaned === ',' || cleaned === '.') return 0;

    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    const normalized =
        lastComma > lastDot
            ? cleaned.replace(/\./g, '').replace(',', '.')
            : cleaned.replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const commitBudgetAmount = (value: number | string): number | string => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const trimmed = value.trim();
    if (trimmed === '' || /[.,]$/.test(trimmed)) return trimmed;
    return parseBudgetAmount(trimmed);
};

export const budgetAmountInputProps = {
    decimalScale: 2,
    fixedDecimalScale: true,
    decimalSeparator: ',',
    thousandSeparator: '.',
    suffix: ' €',
} as const;
