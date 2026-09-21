const express = require("express");

const authenticateToken = require("../middlewares/authMiddleware");
const { createEvidence } = require("../controllers/evidenceController");

const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.post(
    "/:caseId/evidence",
    authenticateToken,
    upload.array("files", 10),
    createEvidence
);
module.exports = router;