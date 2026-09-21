const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const { createCase } = require("../controllers/caseController");

const router = express.Router();

router.post("/", authenticateToken, createCase);

module.exports = router;