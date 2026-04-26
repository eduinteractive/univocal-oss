module.exports = {
    async up(db) {
        await db.collection("tenants").updateMany(
            { isPublic: true },
            { $set: { visibility: "PUBLIC" }, $unset: { isPublic: "" } }
        );
        await db.collection("tenants").updateMany(
            { isPublic: false },
            { $set: { visibility: "HIDDEN" }, $unset: { isPublic: "" } }
        );
        await db.collection("tenants").updateMany(
            { visibility: { $exists: false } },
            { $set: { visibility: "HIDDEN" } }
        );
    },

    async down(db) {
        await db.collection("tenants").updateMany(
            { visibility: "PUBLIC" },
            { $set: { isPublic: true }, $unset: { visibility: "" } }
        );
        await db.collection("tenants").updateMany(
            { visibility: { $in: ["HIDDEN", "ON_REQUEST"] } },
            { $set: { isPublic: false }, $unset: { visibility: "" } }
        );
    },
};
