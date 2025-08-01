const { MongoClient } = require("mongodb");

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT, MONGO_DB } = process.env;

const uri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@db:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(async (client) => {
    const db = client.db("ligipredictor_test");
    const collections = await db.listCollections({ name: "teams" }).toArray();
    if (collections.length > 0) {
      console.log("Seeding teams collection found.");
      process.exit(0);
    } else {
      console.warn("Seeding not complete team collection missing.");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Healthcheck error:", err.message);
    process.exit(1);
  });
