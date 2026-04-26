module.exports = {
    async up(db, client) {
		const updateFields = {
			$set: {
				"integrations.event": false,
			},
		};
		const queryCondition = {
			$or: [{ "integrations.event": { $exists: false } }],
		};

		await db.collection("tenants").updateMany(queryCondition, updateFields);
	},

	async down(db, client) {
		const unsetFields = { $unset: { "integrations.event": "" } };

		await db.collection("tenants").updateMany({}, unsetFields);
	},
};
