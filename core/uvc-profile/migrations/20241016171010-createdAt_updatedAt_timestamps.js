module.exports = {
    async up(db, client) {
        // Step 1: Set the new `createdAt` and `updatedAt` fields from `creationDate`, then remove `creationDate`.
        const updateFields = [
            {
                $set: {
                    createdAt: { $ifNull: ["$createdAt", "$creationDate"] },
                    updatedAt: { $ifNull: ["$updatedAt", "$creationDate"] },
                },
            },
            {
                $unset: "creationDate", // Remove `creationDate` after copying its value
            }
        ];

        const queryCondition = {
            $or: [{ createdAt: { $exists: false } }, { updatedAt: { $exists: false } }],
        };

        // Step 2: Update `projects` collection
        await db.collection("projects").updateMany(queryCondition, updateFields);

        // Step 3: Update `news` collection
        await db.collection("news").updateMany(queryCondition, updateFields);
    },

    async down(db, client) {
        // Step 4: In the "down" migration, we revert by setting `creationDate` back from `createdAt`.
        const updateFields = {
            $set: {
                creationDate: "$createdAt", // Set `creationDate` from `createdAt`
            },
            $unset: {
                createdAt: "", // Remove `createdAt`
                updatedAt: "", // Remove `updatedAt`
            }
        };

        // Step 5: Rollback for `projects` collection
        await db.collection("projects").updateMany({}, updateFields);

        // Step 6: Rollback for `news` collection
        await db.collection("news").updateMany({}, updateFields);
    },
};
