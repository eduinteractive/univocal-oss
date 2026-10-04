/**
 * Indexes for landing analytics. Visitor, visitor-day and IP-hash collections
 * expire automatically so hashed addresses are kept for at most 48h / 30 days.
 */
module.exports = {
	async up(db) {
		await db.collection("landingdailystats").createIndex(
			{
				metric: 1,
				timestamp: 1,
				"dims.path": 1,
				"dims.cta": 1,
				"dims.morigin": 1,
				"dims.referrer": 1,
				"dims.country": 1,
				"dims.device": 1,
				"dims.key": 1,
				"dims.bucket": 1,
			},
			{ unique: true }
		);
		await db.collection("landingiphashes").createIndex({ day: 1, slot: 1, ipHash: 1 }, { unique: true });
		await db.collection("landingiphashes").createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 48 });
		await db.collection("landingvisitordays").createIndex({ day: 1, ipHash: 1 }, { unique: true });
		await db.collection("landingvisitordays").createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 48 });
		await db.collection("landingvisitors").createIndex({ ipHash: 1 }, { unique: true });
		await db.collection("landingvisitors").createIndex({ lastSeen: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
		await db.collection("timeseriesstats").createIndex({ metric: 1, timestamp: 1 });
	},

	async down(db) {
		await Promise.all(
			["landingdailystats", "landingiphashes", "landingvisitordays", "landingvisitors", "timeseriesstats"].map(
				(name) => db.collection(name).dropIndexes().catch(() => undefined)
			)
		);
	},
};
