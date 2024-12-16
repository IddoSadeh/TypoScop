const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// OpenAI Initialization
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API Endpoint
app.post("/api/customize", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // The system message strongly suggests the model return JSON instructions
  const systemMessage = `
You are a Three.js scene designer. You will receive instructions about manipulating a 3D scene.
Always respond with strict JSON that includes:
{
  "action": "<some action>",
  "params": { ... }
}
Possible actions: "changeBackground", "changeTextColor", "createObject", "rotateObject", "none".
If user’s request does not change the scene, respond with:
{ "action": "none", "params": {} }
No extra text or code outside of JSON.
`;

  try {
    const completion =  await openai.chat.completions.create({
      model: "gpt-4o",  
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    // Extract response text from the top-level 'choices' array
    const responseText = completion.choices[0].message.content.trim();
    return res.json({ response: responseText });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
