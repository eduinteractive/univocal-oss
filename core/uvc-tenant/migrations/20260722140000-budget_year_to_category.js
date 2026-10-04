module.exports = {
    async up(db) {
        const budgets = await db.collection("budgets").find({ year: { $exists: true } }).toArray();
        for (const budget of budgets) {
            const category =
                budget.year === null || budget.year === undefined
                    ? ""
                    : String(budget.year);
            await db.collection("budgets").updateOne(
                { _id: budget._id },
                {
                    $set: { category },
                    $unset: { year: "" },
                }
            );
        }
    },

    async down(db) {
        const budgets = await db
            .collection("budgets")
            .find({ category: { $exists: true } })
            .toArray();
        for (const budget of budgets) {
            const parsed = Number.parseInt(budget.category, 10);
            const year =
                budget.category !== undefined &&
                budget.category !== null &&
                budget.category !== "" &&
                !Number.isNaN(parsed) &&
                String(parsed) === String(budget.category).trim()
                    ? parsed
                    : undefined;
            const update =
                year === undefined
                    ? { $unset: { category: "", year: "" } }
                    : { $set: { year }, $unset: { category: "" } };
            await db.collection("budgets").updateOne({ _id: budget._id }, update);
        }
    },
};
