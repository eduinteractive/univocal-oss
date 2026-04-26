module.exports = {
    async up(db, client) {
		const updateFields = {
			$set: {
				"isPublic": false,
			},
		};
		const queryCondition = {
			$or: [{ "isPublic": { $exists: false } }],
		};

		await db.collection("tenants").updateMany(queryCondition, updateFields);
	},

	async down(db, client) {
		const unsetFields = { $unset: { "isPublic": "" } };

		await db.collection("tenants").updateMany({}, unsetFields);
	},
};
