module.exports = {
    async up(db, client) {
		const tokens = await db.collection("calendartokens").find().toArray();
        for (const token of tokens) {
            const originalToken = {
                _id: token._id,
            };

            for (let i = 0; i < 6; i++) {
                await db.collection("calendartokens").insertOne({
                    tenantId: token.tenantId,
                    token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    status: "ACTIVE",
                    viewAccess: i
                });
            }

            await db.collection("calendartokens").deleteOne(originalToken);
        }
	},

	async down(db, client) {
        // No down migration
	},
};
