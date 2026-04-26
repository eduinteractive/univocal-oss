module.exports = {
    async up(db, client) {
      await db.collection('useraccounts').updateMany({
        devices: { $exists: false }
      }, [
        { $set: { devices: [] } }
      ]);
  
      console.log("Alle Geräte wurden erfolgreich hinzugefügt.");
    },
  
    async down(db, client) {
      await db.collection('useraccounts').updateMany({
        devices: { $exists: true }
      }, [
        { $unset: { devices: "" } }
      ]);
    }
  };
  