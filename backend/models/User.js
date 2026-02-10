
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    school: { type: String },
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experiencePoints: { type: Number, default: 0 },

    badges: [
      {
        title: String,
        icon: String,
        earnedAt: Date,
      },
    ],
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
