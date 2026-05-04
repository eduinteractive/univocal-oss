/**
 * Entfernt das veraltete Feld pairwiseId aus useraccounts (keine produktiven DFN-Nutzer).
 * DFN-Login nutzt ausschließlich subjectId (SAML subject-id).
 */
module.exports = {
    async up(db) {
        const coll = db.collection("useraccounts");
        try {
            await coll.dropIndex("pairwiseId_1");
        } catch {
            // index missing
        }
        await coll.updateMany({}, { $unset: { pairwiseId: "" } });
        try {
            await coll.createIndex({ subjectId: 1 }, { unique: true, sparse: true });
        } catch {
            // already exists
        }
    },

    async down() {
        // Kein sinnvolles down ohne Pairwise-Konzept.
    },
};
