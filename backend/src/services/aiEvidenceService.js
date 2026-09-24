const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { checkUrl } = require("./urlCheckService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processEvidenceWithAI = async (evidenceId) => {
    try {
        // 1. Get evidence from database
        const result = await pool.query(
            `SELECT evidence_id, type, file_path
             FROM evidence
             WHERE evidence_id = $1`,
            [evidenceId]
        );

        if (result.rows.length === 0) {
            console.log(`Evidence ${evidenceId} not found`);
            return;
        }

        const evidence = result.rows[0];

        if (evidence.type !== "IMAGE") {
            return;
        }

        // 2. Get image path
        const imagePath = path.resolve(evidence.file_path);

        if (!fs.existsSync(imagePath)) {
            console.log(`Image not found: ${imagePath}`);
            return;
        }

        // 3. Read image
        const imageBuffer = fs.readFileSync(imagePath);

        // 4. Create Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash"
        });

        // 5. Ask Gemini to extract structured information
        const prompt = `
You are an AI scam investigation assistant.

Analyze this screenshot and extract useful information.

Return ONLY valid JSON in this exact structure:

{
  "people": [],
  "companies": [],
  "amounts": [],
  "dates": [],
  "claims": [],
  "urls": [],
  "suspicious_signals": []
}

Rules:
- Do not invent information.
- If something is not present, return an empty array.
- Extract exact text when useful.
- suspicious_signals should contain observable suspicious characteristics.
`;

        const response = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: "image/png"
                }
            }
        ]);

        const responseText = response.response.text();

        console.log("Gemini response:", responseText);

        // 6. Convert Gemini response to JSON
        const cleanedResponse = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const extractedData = JSON.parse(cleanedResponse);

        // 7. Check extracted URLs
            const urlChecks = [];

            if (extractedData.urls && extractedData.urls.length > 0) {
                for (const url of extractedData.urls) {
                    const result = await checkUrl(
                        url.startsWith("http")
                            ? url
                            : `https://${url}`
                    );

                    urlChecks.push(result);
                }
            }

            extractedData.url_checks = urlChecks;

        // 7. Save extracted data to PostgreSQL
        await pool.query(
            `UPDATE evidence
             SET extracted_data = $1
             WHERE evidence_id = $2`,
            [JSON.stringify(extractedData), evidenceId]
        );

        console.log(
            `AI extraction completed for evidence ${evidenceId}`
        );

    } catch (error) {
        console.error(
            `AI processing failed for evidence ${evidenceId}:`,
            error
        );
    }
};

module.exports = {
    processEvidenceWithAI
};