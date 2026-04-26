module.exports = {
    async up(db, client) {
		const updateFields = {
			$set: {
				viewAccess: 0,
			},
		};
		const queryCondition = {
			$or: [{ viewAccess: { $exists: false } }],
		};

		await db.collection("svevents").updateMany(queryCondition, updateFields);
	},

	async down(db, client) {
		const unsetFields = { $unset: { viewAccess: "" } };

		await db.collection("svevents").updateMany({}, unsetFields);
	},
};
