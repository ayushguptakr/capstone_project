require("dotenv").config();
const mongoose = require("mongoose");
const School = require("./models/School");
const User = require("./models/User");
const Class = require("./models/Class");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/capstone_project";

function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function hashStringToInt(str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function pickFrom(list, seed) {
  if (!Array.isArray(list) || list.length === 0) return "";
  const idx = seed % list.length;
  return list[idx];
}

function stableFullName(email, role = "student") {
  const FIRST = [
    "Aarav","Vihaan","Aditya","Arjun","Ishaan","Kabir","Rohan","Vivaan","Kunal","Rahul",
    "Ananya","Aditi","Isha","Kavya","Saanvi","Nisha","Priya","Riya","Meera","Ayesha",
    "Tanvi","Diya","Neha","Sakshi","Pooja","Sneha","Shreya","Aman","Ayush","Sarthak",
  ];
  const LAST = [
    "Sharma","Verma","Gupta","Singh","Kumar","Yadav","Patel","Shah","Mehta","Jain",
    "Agarwal","Choudhary","Malhotra","Kapoor","Bansal","Saxena","Iyer","Nair","Reddy","Das",
    "Bose","Mishra","Pandey","Joshi","Ghosh","Kulkarni","Shetty","Khan","Ansari","Qureshi",
  ];
  const h = hashStringToInt(email);
  const first = pickFrom(FIRST, h);
  const last = pickFrom(LAST, h >>> 8);
  const base = `${first} ${last}`;
  if (role === "principal") {
    const honorific = (h % 3 === 0) ? "Dr." : (h % 3 === 1 ? "Mr." : "Ms.");
    return `${honorific} ${base}`;
  }
  return base;
}

async function upsertSchool({ name, address }) {
  const existing = await School.findOne({ name }).select("_id principalId name").lean();
  if (existing) return existing;
  const created = await School.create({ name, address, status: "active" });
  return created.toObject();
}

async function upsertUser({ name, email, password, role, schoolId, schoolName }) {
  const existing = await User.findOne({ email }).select("_id role schoolId school status").lean();
  if (existing) {
    // Ensure they remain linked to the school and active for demo.
    await User.updateOne(
      { _id: existing._id },
      {
        $set: {
          name,
          role,
          status: "active",
          schoolId: schoolId || existing.schoolId,
          school: schoolName || existing.school || "",
        },
      }
    );
    return { _id: existing._id, email };
  }
  const created = await User.create({
    name,
    email,
    password,
    role,
    status: "active",
    schoolId,
    school: schoolName || "",
    isFirstLogin: false,
  });
  return { _id: created._id, email };
}

async function upsertClass({ schoolId, name, section }) {
  const existing = await Class.findOne({ schoolId, name, section }).select("_id name section label").lean();
  if (existing) return existing;
  const created = await Class.create({ schoolId, name, section });
  return created.toObject();
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pickLeague(weeklyXP) {
  if (weeklyXP >= 900) return "diamond";
  if (weeklyXP >= 600) return "gold";
  if (weeklyXP >= 350) return "silver";
  return "bronze";
}

async function upsertStudent({ name, email, password, schoolId, schoolName, classLabel, className, section, points, weeklyXP, league }) {
  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      {
        $set: {
          name,
          role: "student",
          status: "active",
          schoolId,
          school: schoolName || "",
          className: classLabel,
          class: className,
          section,
          points,
          weeklyXP,
          league,
          level: Math.max(1, Math.floor(Number(points || 0) / 250) + 1),
          isFirstLogin: false,
        },
      }
    );
    return { _id: existing._id, email };
  }
  const created = await User.create({
    name,
    email,
    password,
    role: "student",
    status: "active",
    schoolId,
    school: schoolName || "",
    className: classLabel,
    class: className,
    section,
    points,
    weeklyXP,
    league,
    level: Math.max(1, Math.floor(Number(points || 0) / 250) + 1),
    isFirstLogin: false,
  });
  return { _id: created._id, email };
}

async function seedDemoSchools({ count = 10, teachersPerSchool = 3, classesPerSchool = 4, studentsPerClass = 22 }) {
  const demoPassword = process.env.DEMO_SEED_PASSWORD || "EcoQuest@123";

  const SCHOOL_NAMES = [
    "Green Valley Public School",
    "Riverdale High School",
    "Sunrise International Academy",
    "EcoFuture Public School",
    "Blue Planet Senior Secondary",
    "Harmony Public School",
    "Oakwood Modern School",
    "Starlight Academy",
    "Evergreen Convent School",
    "Pioneer Public School",
  ].slice(0, Math.max(1, Math.min(10, count)));

  const createdSummary = [];

  for (const schoolName of SCHOOL_NAMES) {
    console.log(`\n[1/3] School: ${schoolName}`);
    const schoolSlug = slugify(schoolName);
    const school = await upsertSchool({
      name: schoolName,
      address: `Campus Road, ${schoolName.split(" ")[0]} City`,
    });

    // Principal
    const principalEmail = `principal.${schoolSlug}@ecoquest.demo`;
    const principalName = stableFullName(principalEmail, "principal");
    const principal = await upsertUser({
      name: principalName,
      email: principalEmail,
      password: demoPassword,
      role: "principal",
      schoolId: school._id,
      schoolName,
    });
    console.log(`[2/3] Principal: ${principalEmail}`);

    // Ensure School.principalId points at principal
    await School.updateOne(
      { _id: school._id },
      { $set: { principalId: principal._id, status: "active" } }
    );

    // Teachers
    const teachers = [];
    for (let i = 1; i <= teachersPerSchool; i += 1) {
      const email = `teacher${i}.${schoolSlug}@ecoquest.demo`;
      const teacher = await upsertUser({
        name: stableFullName(email, "teacher"),
        email,
        password: demoPassword,
        role: "teacher",
        schoolId: school._id,
        schoolName,
      });
      teachers.push(teacher);
    }
    console.log(`[2/3] Teachers: ${teachers.length}`);

    // Classes (and assign teachers to classes)
    const classPairs = [
      { name: "6", section: "A" },
      { name: "6", section: "B" },
      { name: "7", section: "A" },
      { name: "7", section: "B" },
      { name: "8", section: "A" },
      { name: "8", section: "B" },
    ].slice(0, Math.max(1, Math.min(6, classesPerSchool)));

    const classes = [];
    for (const cp of classPairs) {
      const cls = await upsertClass({ schoolId: school._id, name: cp.name, section: cp.section });
      classes.push(cls);
    }
    console.log(`[3/3] Classes: ${classes.length} | students/class: ${studentsPerClass}`);

    // Round-robin teacher assignment (best-effort)
    for (let i = 0; i < teachers.length; i += 1) {
      const slice = classes.filter((_, idx) => idx % teachers.length === i).map((c) => c._id);
      if (slice.length > 0) {
        await User.updateOne(
          { _id: teachers[i]._id },
          { $set: { assignedClasses: slice, classAssigned: classes.find((c) => String(c._id) === String(slice[0]))?.label || "" } }
        );
      }
    }

    // Students per class
    const students = [];
    for (const cls of classes) {
      for (let i = 1; i <= studentsPerClass; i += 1) {
        const studentEmail = `student${String(i).padStart(2, "0")}.${slugify(cls.label || `${cls.name}${cls.section}`)}.${schoolSlug}@ecoquest.demo`;
        const points = randInt(0, 2200);
        const weeklyXP = randInt(0, 1200);
        const league = pickLeague(weeklyXP);
        const student = await upsertStudent({
          name: stableFullName(studentEmail, "student"),
          email: studentEmail,
          password: demoPassword,
          schoolId: school._id,
          schoolName,
          classLabel: cls.label || `${cls.name}-${cls.section}`,
          className: cls.name,
          section: cls.section,
          points,
          weeklyXP,
          league,
        });
        students.push(student.email);
      }
    }
    console.log(`[3/3] Students created/updated: ${students.length}`);

    createdSummary.push({
      school: { _id: String(school._id), name: schoolName },
      principal: { email: principalEmail },
      teachers: teachers.map((t) => t.email),
      classes: classes.map((c) => c.label || `${c.name}-${c.section}`),
      studentsCount: students.length,
    });
  }

  return { demoPassword, createdSummary };
}

async function main() {
  const count = Math.max(1, Math.min(10, parseInt(process.env.DEMO_SCHOOL_COUNT || "10", 10) || 10));
  const teachersPerSchool = Math.max(1, Math.min(6, parseInt(process.env.DEMO_TEACHERS_PER_SCHOOL || "3", 10) || 3));
  const classesPerSchool = Math.max(1, Math.min(6, parseInt(process.env.DEMO_CLASSES_PER_SCHOOL || "4", 10) || 4));
  const studentsPerClass = Math.max(5, Math.min(40, parseInt(process.env.DEMO_STUDENTS_PER_CLASS || "22", 10) || 22));

  console.log("Connecting to MongoDB...");
  console.log(`MONGO_URI: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 7000,
    connectTimeoutMS: 7000,
  });
  console.log("Connected.");
  try {
    const res = await seedDemoSchools({ count, teachersPerSchool, classesPerSchool, studentsPerClass });
    console.log(
      `Seeded demo schools: ${count} | teachers/school: ${teachersPerSchool} | classes/school: ${classesPerSchool} | students/class: ${studentsPerClass}`
    );
    console.log(`Demo password: ${res.demoPassword}`);
    console.log("Demo accounts created/updated:");
    res.createdSummary.forEach((row) => {
      console.log(`- ${row.school.name}`);
      console.log(`  principal: ${row.principal.email}`);
      row.teachers.forEach((e) => console.log(`  teacher:   ${e}`));
      console.log(`  classes:   ${(row.classes || []).join(", ")}`);
      console.log(`  students:  ${row.studentsCount}`);
    });
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

main().catch((err) => {
  console.error("Error seeding demo schools:", err);
  process.exitCode = 1;
});

