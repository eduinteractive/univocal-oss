module.exports = {
	async up(db, client) {
		const updateFields = {
			$set: {
				"config.toc": {
                    enabled: false,
                    content: "",
                    materials: [],
                },
			},
		};
		const queryCondition = {
			$or: [{ "config.toc": { $exists: false } }],
		};

		await db.collection("svevents").updateMany(queryCondition, updateFields);
	},

	async down(db, client) {
		const unsetFields = { $unset: { "config.toc": "" } };

		await db.collection("svevents").updateMany({}, unsetFields);
	},
};
