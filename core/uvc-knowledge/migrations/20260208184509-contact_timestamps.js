module.exports = {
    async up(db, client) {
      const queryCondition = {
        $or: [{ createdAt: { $exists: false } }, { updatedAt: { $exists: false } }]
      }
      const updateFields = {
        $set: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
      await db.collection('contacts').updateMany(queryCondition, updateFields);
    },
  
    async down(db, client) {
      const queryCondition = {
        $or: [{ createdAt: { $exists: true } }, { updatedAt: { $exists: true } }]
      }
      const unsetFields = { $unset: { createdAt: '', updatedAt: '' } };
      await db.collection('contacts').updateMany(queryCondition, unsetFields);
    }
  };
  