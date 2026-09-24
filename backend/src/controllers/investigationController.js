const { analyzeCase } = require("../services/investigationService");

const runInvestigation = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user.userId;

        // Check that the case belongs to the logged-in user
        const pool = require("../config/db");

        const caseResult = await pool.query(
            `SELECT case_id
             FROM cases
             WHERE case_id = $1 AND user_id = $2`,
            [caseId, userId]
        );

        if (caseResult.rows.length === 0) {
            return res.status(404).json({
                message: "Case not found"
            });
        }

        const result = await analyzeCase(caseId);

        if (!result.success) {
            return res.status(500).json({
                message: result.message
            });
        }

        res.status(200).json({
            message: "Investigation completed successfully",
            findings: result.findings
        });

    } catch (error) {
        console.error(
            "Run investigation error:",
            error
        );

        res.status(500).json({
            message: "Failed to run investigation"
        });
    }
};

module.exports = {
    runInvestigation
};