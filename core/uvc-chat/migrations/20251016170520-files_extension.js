module.exports = {
    async up(db, client) {
		const updateFields = {
			$set: {
				files: []
			},
		};
		const queryCondition = {
			$or: [{ files: { $exists: false } }],
		};

		await db.collection("groupmessages").updateMany(queryCondition, updateFields);
        await db.collection("privatemessages").updateMany(queryCondition, updateFields);
	},

	async down(db, client) {
		const unsetFields = { $unset: { files: "" } };

		await db.collection("groupmessages").updateMany({}, unsetFields);
        await db.collection("privatemessages").updateMany({}, unsetFields);
	},
};
