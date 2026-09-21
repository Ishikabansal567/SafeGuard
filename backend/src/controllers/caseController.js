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

module.exports = {
    createCase
};