module.exports = {
    async up(db) {
        await db.collection("useraccounts").updateMany(
            { authProvider: { $exists: false } },
            { $set: { authProvider: "LOCAL" } }
        );
    },

    async down(db) {
        await db.collection("useraccounts").updateMany(
            {},
            { $unset: { authProvider: "", pairwiseId: "", schacHomeOrganization: "" } }
        );
    },
};
