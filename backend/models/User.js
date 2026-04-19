
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "teacher", "admin", "sponsor", "principal"],
      default: "student",
    },
    school: { type: String },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    isFirstLogin: { type: Boolean, default: true },
    /** Plant-based loss aversion system */
    plantHealth: { type: Number, default: 100, min: 0, max: 100 },
    plantLastDecayedAt: { type: Date },
    plantHealthGainedToday: { type: Number, default: 0 },
    plantLastGainedAt: { type: Date },
    
    /** Teacher AI Insights */
    aiInsightCache: {
      text: { type: String },
      dateKey: { type: String },
      refreshing: { type: Boolean, default: false }
    },
    /** For teachers: which class they are assigned to (e.g. "10"). */
    classAssigned: { type: String },
    /** Who provisioned this account (principalId or adminId). */
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    /** Optional: for class-level aggregation (e.g. "Class 10-A"). */
    className: { type: String },
    /** Optional: normalized class and section support for filtering/grouping. */
    class: { type: String },
    section: { type: String },
    points: { type: Number, default: 0 },
    /** Green Credits from environmental impact (redeemable, certificates, reports). */
    greenCredits: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experiencePoints: { type: Number, default: 0 },
    league: {
      type: String,
      enum: ["bronze", "silver", "gold", "diamond"],
      default: "bronze"
    },
    weeklyXP: { type: Number, default: 0 },
    streakCurrent: { type: Number, default: 0 },
    streakLastActiveAt: { type: Date },
    streakFreezeUntil: { type: Date, default: null },
    lastActivityAt: { type: Date },
    equippedAvatar: { type: String, default: "User" },
    equippedSkins: {
      hat: { type: String, default: null },
      accessory: { type: String, default: null },
      effect: { type: String, default: null },
      evolution: { type: String, default: null },
    },
    
    // Deep Gamification / Game Mastery
    miniGameProgress: {
      type: Map,
      of: new mongoose.Schema({
        unlockedLevel: { type: Number, default: 1 },
        scores: { type: [Number], default: [0, 0, 0] },
        stars: { type: [Number], default: [0, 0, 0] },
        attempts: { type: Number, default: 0 },
        lastPlayedAt: { type: Date, default: null },
        playStreak: { type: Number, default: 0 }
      }, { _id: false }),
      default: {}
    },
    
    quizProgress: {
      type: Map,
      of: new mongoose.Schema({
        bestScore: { type: Number, default: 0 },
        lastScore: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 },
        lastPlayedAt: { type: Date, default: null }
      }, { _id: false }),
      default: {}
    },

    badges: {
      type: [String],
      default: []
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
