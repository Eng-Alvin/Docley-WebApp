const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("CRITICAL: GOOGLE_API_KEY is missing in .env file");
    process.exit(1);
}

console.log("Found API Key:", apiKey.substring(0, 5) + "...");

async function listModels() {
    console.log("\n--- Checking API Status & Available Models ---");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        // PRINT THE RAW RESPONSE TO DIAGNOSE
        console.log("Raw API Response for ListModels:");
        console.log(JSON.stringify(data, null, 2));

        if (data.error) {
            console.error("\n!!! API ERROR DETECTED !!!");
            console.error(`Code: ${data.error.code}`);
            console.error(`Message: ${data.error.message}`);
            console.error(`Status: ${data.error.status}`);
            return false;
        }

        return true;

    } catch (e) {
        console.error("Failed to list models via HTTP:", e.message);
        return false;
    }
}

async function testModel(modelName) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log(`\nTesting model '${modelName}'...`);
        const prompt = "Say 'Hello!'";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`SUCCESS with ${modelName}! Response:`, response.text());
        return true;
    } catch (error) {
        console.error(`FAILED with ${modelName}.`);
        // Print the error details this time
        if (error.response) {
            console.error("Error Response:", JSON.stringify(error.response, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
        return false;
    }
}

async function run() {
    await listModels();

    // Still try one standard model to see the generation error explicitly
    await testModel("gemini-2.5-flash");
}

run();
