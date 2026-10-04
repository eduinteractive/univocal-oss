module.exports = {
    async up(db, client) {
        await db.collection("profiles").updateMany(
            { site: { $exists: false } },
            {
                $set: {
                    site: {
                        published: false,
                        galleryImages: [],
                        sections: [
                            { type: "BOARD", enabled: true, featuredIds: [] },
                            { type: "EVENTS", enabled: true, featuredIds: [] },
                            { type: "SURVEYS", enabled: true, featuredIds: [] },
                            { type: "SUPPORT", enabled: true, featuredIds: [] },
                        ],
                    },
                },
            }
        );

        await db.collection("profiles").createIndex(
            { "site.subdomain": 1 },
            { unique: true, partialFilterExpression: { "site.subdomain": { $type: "string" } } }
        );
        await db.collection("profilepages").createIndex({ tenantId: 1, slug: 1 }, { unique: true });
    },

    async down(db, client) {
        await db.collection("profiles").updateMany({}, { $unset: { site: "" } });
    },
};
