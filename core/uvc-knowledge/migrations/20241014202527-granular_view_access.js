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

		await db.collection("contactgroups").updateMany(queryCondition, updateFields);
        await db.collection("wikis").updateMany(queryCondition, updateFields);
	},

	async down(db, client) {
		const unsetFields = { $unset: { viewAccess: "" } };

		await db.collection("contactgroups").updateMany({}, unsetFields);
        await db.collection("wikis").updateMany({}, unsetFields);
	},
};
