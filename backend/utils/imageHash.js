const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Simple hash of image file for duplicate detection.
 * Uses file path or buffer; in production you might use perceptual hashing (e.g. sharp + phash).
 * For now we use SHA-256 of file content as a reliable duplicate check.
 * @param {string|Buffer} filePathOrBuffer - path to file or buffer
 * @returns {Promise<string>} hex hash
 */
async function computeImageHash(filePathOrBuffer) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    if (Buffer.isBuffer(filePathOrBuffer)) {
      hash.update(filePathOrBuffer);
      return resolve(hash.digest("hex"));
    }
    const p = typeof filePathOrBuffer === "string" ? filePathOrBuffer : null;
    if (!p) return reject(new Error("Invalid input: path or buffer required"));
    const stream = fs.createReadStream(p);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

/**
 * Compute hash from multer upload (req.file).
 * req.file may have path (disk) or buffer.
 */
async function computeImageHashFromUpload(file) {
  if (!file) return null;
  if (file.buffer) return computeImageHash(file.buffer);
  if (file.path) return computeImageHash(file.path);
  return null;
}

module.exports = { computeImageHash, computeImageHashFromUpload };
