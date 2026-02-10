const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// File filter (images + pdf)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

module.exports = multer({ storage, fileFilter });
