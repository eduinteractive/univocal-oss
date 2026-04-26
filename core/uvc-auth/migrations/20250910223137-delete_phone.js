module.exports = {
    async up(db, client) {
        await db.collection('useraccounts').updateMany(
            {
                phone: { $exists: true }
            },
            { 
                $unset: { phone: "" } 
            }
        );
  
        console.log("Alle Telefonnummern wurden erfolgreich gelöscht.");
    },
  
    async down(db, client) {
      // nothing to do
    }
  };
  