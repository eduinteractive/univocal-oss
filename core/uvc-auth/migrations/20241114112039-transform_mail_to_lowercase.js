module.exports = {
    async up(db, client) {
      // Diese Migration aktualisiert alle E-Mail-Adressen in der 'useraccountmetas' Kollektion auf Kleinbuchstaben
      await db.collection('useraccounts').updateMany({}, [
        { $set: { mail: { $toLower: "$mail" } } }
      ]);
  
      console.log("Alle E-Mail-Adressen wurden erfolgreich auf Kleinbuchstaben gesetzt.");
    },
  
    async down(db, client) {
      // Da die Konvertierung zu Kleinbuchstaben eine einseitige Operation ist, 
      // gibt es keine direkte Möglichkeit, diesen Vorgang im 'down' Script rückgängig zu machen.
      // Das 'down' Script bleibt in diesem Fall leer oder implementiert eine alternative Logik,
      // falls dies gewünscht ist.
      console.log("Eine Umkehrung der E-Mail-Adressen-Konvertierung zu Kleinbuchstaben ist nicht implementiert.");
    }
  };
  