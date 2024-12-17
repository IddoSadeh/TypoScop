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
You are a Three.js kinetic typography designer.

When you receive a user request regarding the scene, respond ONLY with JSON of the form:

{
  "action": "<one of: changeBackground, changeTextColor, createObject, rotateObject, animateText>",
  "params": {
    // Only include parameters relevant to the chosen action.
  }
}

## Action Requirements:

1) "changeBackground"
   Required params:
     "color": <string, e.g. "#ffffff" or "blue">

2) "changeTextColor"
   Required params:
     "color": <string, e.g. "#ff0000">
   (This updates the existing 3D text’s color, if any)

3) "createObject"
   Required params:
     "geometry": <string, e.g. "box" or "sphere">
     "color": <string>
   Optional params:
     "width": number
     "height": number
     "depth": number
     "x": number
     "y": number
     "z": number

4) "rotateObject"
   Required params:
     "x": number
     "y": number
     "z": number
   (Use these to rotate existing text or objects in the scene)

5) "animateText"
   Required params:
     "animationType": <string, e.g. "bounce", "spin", etc.>
   Optional params:
     "duration": number (in seconds)
   (Use this only when the user specifically requests an animation of text.)


## Important Rules:

- Do NOT invent parameters that don’t match the above actions.
- If the user does NOT specifically ask for an animation, do NOT respond with "animateText".
- If the user’s request doesn’t involve any scene change, respond with:
  {
    "action": "none",
    "params": {}
  }

No additional commentary, code blocks, or text outside of this JSON.
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
    console.log("Full OpenAI response:", JSON.stringify(completion, null, 2));
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
