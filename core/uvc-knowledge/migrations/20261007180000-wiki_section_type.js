module.exports = {
    async up(db) {
        await db.collection("wikisections").updateMany(
            { type: { $exists: false } },
            { $set: { type: "editor" } }
        );
    },

    async down(db) {
        await db.collection("wikisections").updateMany(
            { type: "editor" },
            { $unset: { type: "" } }
        );
    }
};
