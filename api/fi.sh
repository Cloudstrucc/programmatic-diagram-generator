mongosh
use diagram-generator
db.diagrams.updateOne(
  { _id: ObjectId("6976643d93482d88a55fe0c8") },
  { $set: { status: "failed", error: "Fixed queue manager - please retry" } }
)