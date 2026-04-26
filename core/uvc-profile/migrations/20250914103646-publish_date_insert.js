module.exports = {
    async up(db, client) {
        // Step 1: Set the new `publishDate` field
        const updateFields = [
            {
                $set: { publishDate: new Date() }
            },
        ];

        const queryCondition = {
            publishDate: { $exists: false },
            status: "PUBLISHED"
        };

        // Step 2: Update `projects` collection to set the `publishDate` field
        await db.collection("projects").updateMany(queryCondition, updateFields);

        // Step 3: Update `news` collection to set the `publishDate` field
        await db.collection("news").updateMany(queryCondition, updateFields);
    },

    async down(db, client) {
        // Nothing to do
    },
};
