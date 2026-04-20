const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },       // e.g. "10"
    section: { type: String, default: "" },        // e.g. "A"
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    /** Computed display label: "10-A" */
    label: { type: String },
  },
  { timestamps: true }
);

// Auto-generate label before save
classSchema.pre("save", function (next) {
  this.label = this.section ? `${this.name}-${this.section}` : this.name;
  next();
});

// Compound unique: no duplicate class+section within a school
classSchema.index({ schoolId: 1, name: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);
