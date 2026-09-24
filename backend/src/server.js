require("dotenv").config();
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
const express = require("express");
const cors = require("cors");


const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const investigationRoutes = require("./routes/investigationRoutes");

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD exists:", !!process.env.DB_PASSWORD);


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "SafeCase API is running"
    });
});


app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.use("/api/cases", caseRoutes);
app.use("/api/cases", evidenceRoutes);
app.use("/api/investigations", investigationRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SafeCase server running on port ${PORT}`);
});

