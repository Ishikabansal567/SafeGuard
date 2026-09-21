const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const { createCase, getCases } = require("../controllers/caseController");

const router = express.Router();

router.post("/", authenticateToken, createCase);
router.get("/", authenticateToken, getCases);

module.exports = router;