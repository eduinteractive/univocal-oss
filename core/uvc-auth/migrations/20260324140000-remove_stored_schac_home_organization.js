/** schacHomeOrganization wird nur noch aus dem DFN-Prinzipal (subject-id) abgeleitet, nicht mehr persistiert. */
module.exports = {
    async up(db) {
        await db.collection("useraccounts").updateMany(
            { schacHomeOrganization: { $exists: true } },
            { $unset: { schacHomeOrganization: "" } }
        );
    },

    async down() {
        // Kein sinnvolles down: alter Wert war nicht mehr die Quelle der Wahrheit.
    },
};
