const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const { createCase, getCases, getCaseById } = require("../controllers/caseController");

const router = express.Router();

router.post("/", authenticateToken, createCase);
router.get("/", authenticateToken, getCases);
router.get("/:caseId", authenticateToken, getCaseById);

module.exports = router;