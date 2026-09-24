const pool = require("../config/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const analyzeCase = async (caseId) => {
    try {
        // 1. Get all evidence for the case
        const result = await pool.query(
            `SELECT evidence_id, type, content, extracted_data, created_at
             FROM evidence
             WHERE case_id = $1
             ORDER BY created_at ASC`,
            [caseId]
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "No evidence found for this case"
            };
        }

        const evidence = result.rows;

        // 2. Prepare evidence for AI
        const investigationData = evidence.map((item) => ({
            evidence_id: item.evidence_id,
            type: item.type,
            content: item.content,
            extracted_data: item.extracted_data,
            created_at: item.created_at
        }));

        // 3. Create Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash"
        });

        // 4. Ask Gemini to connect the evidence
        const prompt = `
You are an AI scam investigation assistant.

Analyze ALL the evidence from this investigation together.

Your goal is to identify relationships, contradictions,
mismatches, and suspicious patterns across the evidence.

Do NOT simply repeat the extracted information.

Return ONLY valid JSON in this structure:

{
  "signals": [
    {
      "title": "",
      "explanation": "",
      "evidence_ids": []
    }
  ]
}

Rules:
- Only identify signals supported by the provided evidence.
- Do not invent facts.
- Compare information across different evidence items when possible.
- evidence_ids must contain the evidence IDs supporting the signal.
- Keep explanations clear and concise.
- If there are no meaningful suspicious signals, return an empty signals array.

Evidence:
${JSON.stringify(investigationData, null, 2)}
`;

        const response = await model.generateContent(prompt);

        const responseText = response.response.text();

        console.log(
            "Investigation AI response:",
            responseText
        );

        // 5. Clean Gemini response
        const cleanedResponse = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const findings = JSON.parse(cleanedResponse);

        // 6. Save findings for this case
        await pool.query(
            `INSERT INTO investigations
             (case_id, findings)
             VALUES ($1, $2)`,
            [
                caseId,
                JSON.stringify(findings)
            ]
        );

        console.log(
            `Investigation analysis completed for case ${caseId}`
        );

        return {
            success: true,
            findings
        };

    } catch (error) {
        console.error(
            `Investigation analysis failed for case ${caseId}:`,
            error
        );

        return {
            success: false,
            message: "Investigation analysis failed"
        };
    }
};

module.exports = {
    analyzeCase
};