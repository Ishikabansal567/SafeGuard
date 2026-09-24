require("dotenv").config({
    path: require("path").resolve(__dirname, "../../../.env")
});

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD type:", typeof process.env.DB_PASSWORD);
console.log("DB_PASSWORD exists:", !!process.env.DB_PASSWORD);

const { analyzeCase } = require("./investigationService");

const test = async () => {
    console.log("STARTING INVESTIGATION TEST");

    const result = await analyzeCase(4);

    console.log("RESULT:");
    console.log(JSON.stringify(result, null, 2));
};

test();