const pool = require("../config/db");

const createCase = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({
                message: "Case title is required"
            });
        }

        const result = await pool.query(
            `INSERT INTO cases (user_id, title, description)
             VALUES ($1, $2, $3)
             RETURNING case_id, user_id, title, description, status, created_at, updated_at`,
            [userId, title, description || null]
        );

        res.status(201).json({
            message: "Case created successfully",
            case: result.rows[0]
        });

    } catch (error) {
        console.error("Create case error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getCases = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT case_id, title, description, status, created_at, updated_at
             FROM cases
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json({
            cases: result.rows
        });

    } catch (error) {
        console.error("Get cases error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createCase,
    getCases
};