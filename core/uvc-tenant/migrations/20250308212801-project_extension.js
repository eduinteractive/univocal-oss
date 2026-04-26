module.exports = {
    async up(db, client) {
		const updateFields = {
			$set: {
				"integrations.project": true,
			},
		};
		const queryCondition = {
			$or: [{ "integrations.project": { $exists: false } }],
		};

		await db.collection("tenants").updateMany(queryCondition, updateFields);
	},

	async down(db, client) {
		const unsetFields = { $unset: { "integrations.project": "" } };

		await db.collection("tenants").updateMany({}, unsetFields);
	},
};
