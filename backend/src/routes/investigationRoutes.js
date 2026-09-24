const express = require("express");

const authenticateToken = require("../middlewares/authMiddleware");
const {
    runInvestigation
} = require("../controllers/investigationController");

const router = express.Router();

router.post(
    "/:caseId/run",
    authenticateToken,
    runInvestigation
);

module.exports = router;