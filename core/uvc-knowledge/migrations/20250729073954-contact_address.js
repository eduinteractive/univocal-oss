module.exports = {
  async up(db, client) {
    const queryCondition = {
      $or: [{ title: { $exists: false } }, { street: { $exists: false } }, { zip: { $exists: false } }, { city: { $exists: false } }]
    }
    const updateFields = {
      $set: {
        title: '',
        street: '',
        zip: '',
        city: ''
      }
    }
    await db.collection('contacts').updateMany(queryCondition, updateFields);
  },

  async down(db, client) {
    const queryCondition = {
      $or: [{ title: { $exists: true } }, { street: { $exists: true } }, { zip: { $exists: true } }, { city: { $exists: true } }]
    }
    const unsetFields = { $unset: { title: '', street: '', zip: '', city: '' } };
    await db.collection('contacts').updateMany(queryCondition, unsetFields);
  }
};
