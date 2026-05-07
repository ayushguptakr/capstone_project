require("dotenv").config();
const mongoose = require("mongoose");
const School = require("./models/School");
const User = require("./models/User");
const Class = require("./models/Class");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/capstone_project";

function isDemoEmail(email = "") {
  return String(email || "").toLowerCase().endsWith("@ecoquest.demo");
}

async function main() {
  const keep = Math.max(1, Math.min(10, parseInt(process.env.DEMO_SCHOOL_KEEP || "5", 10) || 5));
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 7000, connectTimeoutMS: 7000 });
  console.log("Connected.");

  try {
    const demoSchools = await School.find({ name: { $exists: true } })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    // Only prune schools that have demo principal email linked.
    const schoolsWithDemoPrincipals = [];
    for (const s of demoSchools) {
      if (!s.principalId) continue;
      const principal = await User.findById(s.principalId).select("email").lean();
      if (principal?.email && isDemoEmail(principal.email)) {
        schoolsWithDemoPrincipals.push(s);
      }
    }

    const keepSchools = schoolsWithDemoPrincipals.slice(0, keep);
    const pruneSchools = schoolsWithDemoPrincipals.slice(keep);

    console.log(`Demo schools found: ${schoolsWithDemoPrincipals.length}`);
    console.log(`Keeping: ${keepSchools.length}`);
    console.log(`Pruning (deactivate): ${pruneSchools.length}`);

    for (const s of pruneSchools) {
      console.log(`- Deactivating school: ${s.name}`);
      await School.updateOne({ _id: s._id }, { $set: { status: "inactive" } });
      // Deactivate demo users linked to this school
      await User.updateMany(
        { schoolId: s._id, email: { $regex: /@ecoquest\.demo$/i } },
        { $set: { status: "inactive" } }
      );
      // Classes can remain; they are school-scoped. Optionally delete:
      await Class.deleteMany({ schoolId: s._id });
    }

    console.log("Prune complete.");
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

main().catch((err) => {
  console.error("Error pruning demo schools:", err);
  process.exitCode = 1;
});

