const pool = require("../config/db");

const createEvidence = async (req, res) => {
    const client = await pool.connect();

    try {
        const { caseId } = req.params;
        const { text, url } = req.body;
        const userId = req.user.userId;


        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        // Check case ownership
        const caseResult = await client.query(
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

        // At least one evidence item is required
        if (!text && !url && (!req.files || req.files.length === 0)) {
            return res.status(400).json({
                message: "At least one evidence item is required"
            });
        }

        // Validate URL if provided
        if (url) {
            try {
                new URL(url);
            } catch (error) {
                return res.status(400).json({
                    message: "Invalid URL"
                });
            }
        }

        await client.query("BEGIN");

        const createdEvidence = [];

        // TEXT evidence
        if (text) {
            const result = await client.query(
                `INSERT INTO evidence (case_id, type, content)
                 VALUES ($1, $2, $3)
                 RETURNING evidence_id, case_id, type, content, file_path, created_at`,
                [caseId, "TEXT", text]
            );

            createdEvidence.push(result.rows[0]);
        }

        // URL evidence
        if (url) {
            const result = await client.query(
                `INSERT INTO evidence (case_id, type, content)
                 VALUES ($1, $2, $3)
                 RETURNING evidence_id, case_id, type, content, file_path, created_at`,
                [caseId, "URL", url]
            );

            createdEvidence.push(result.rows[0]);
        }

        // IMAGE / FILE evidence
        if (req.files) {
            for (const file of req.files) {
                const type = file.mimetype.startsWith("image/")
                    ? "IMAGE"
                    : "FILE";

                const result = await client.query(
                    `INSERT INTO evidence (case_id, type, file_path)
                     VALUES ($1, $2, $3)
                     RETURNING evidence_id, case_id, type, content, file_path, created_at`,
                    [caseId, type, file.path]
                );

                createdEvidence.push(result.rows[0]);
            }
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Evidence added successfully",
            evidence: createdEvidence
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Create evidence error:", error);

        res.status(500).json({
            message: "Server error"
        });
    } finally {
        client.release();
    }
};

module.exports = {
    createEvidence
};