module.exports = {
    async up(db, client) {
        await db.collection('useraccounts').updateMany({
            activationStatus: true
        }, [
            { $set: { activationStatus: "ACTIVATED" } }
        ]);

        await db.collection('useraccounts').updateMany({
            activationStatus: false
        }, [
            { $set: { activationStatus: "NOT_VERIFIED" } }
        ]);
    },
  
    async down(db, client) {
        await db.collection('useraccounts').updateMany({
            activationStatus: "ACTIVATED"
        }, [
            { $set: { activationStatus: true } }
        ]);

        await db.collection('useraccounts').updateMany({
            activationStatus: "NOT_VERIFIED"
        }, [
            { $set: { activationStatus: false } }
        ]);

        await db.collection('useraccounts').updateMany({
            activationStatus: "BANNED"
        }, [
            { $set: { activationStatus: false } }
        ]);
    }
  };
  