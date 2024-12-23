const express = require('express');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI client and current state
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let currentState = {
    text: 'Hello, World!',
    size: 50,
    depth: 1,
    font: 'helvetiker',
    color: '#ffffff',
    curveSegments: 12,
    bevelEnabled: false,
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelOffset: 0,
    bevelSegments: 3,
    backgroundColor: '#000000', // Default background color
};

app.post('/api/customize', async (req, res) => {
    const { prompt } = req.body;

    const functionSchema = {
        name: 'createText',
        description: 'Generate text with fully adjustable TextGeometry parameters. Modify the current state based on the user prompt.',
        parameters: {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'The text to display. If not specified, reuse the current text. (No longer than 30 characters)' },
                size: { type: 'number', description: 'Size of the text (always 50).' },
                depth: { type: 'number', description: 'Thickness of the text (reasonable range: 1-5).' },
                font: { type: 'string', description: 'Font name (e.g., helvetiker, optimer, gentilis).' },
                curveSegments: { type: 'integer', description: 'Number of points on the curves (reasonable range: 4-20).' },
                bevelEnabled: { type: 'boolean', description: 'Enable beveling on the text.' },
                bevelThickness: { type: 'number', description: 'Thickness of the bevel (reasonable range: 1-10).' },
                bevelSize: { type: 'number', description: 'Size of the bevel (reasonable range: 1-8).' },
                bevelOffset: { type: 'number', description: 'Offset for the bevel (reasonable range: 0-5).' },
                bevelSegments: { type: 'integer', description: 'Number of bevel segments (reasonable range: 1-10).' },
                color: { type: 'string', description: 'Hexadecimal color of the text (e.g., #ff5733 for vibrant orange).' },
                backgroundColor: { type: 'string', description: 'Hexadecimal color for the scene background (e.g., #000000 for black).' },
            },
        },
    };

    try {
        // Include the current state in the system message
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a creative graphic designer. Here's the current state of the text geometry and scene:
Text: "${currentState.text}"
Size: ${currentState.size}
Depth: ${currentState.depth}
Font: "${currentState.font}"
Color: ${currentState.color}
Background Color: ${currentState.backgroundColor}
Curve Segments: ${currentState.curveSegments}
Bevel Enabled: ${currentState.bevelEnabled}
Bevel Thickness: ${currentState.bevelThickness}
Bevel Size: ${currentState.bevelSize}
Bevel Offset: ${currentState.bevelOffset}
Bevel Segments: ${currentState.bevelSegments}

Modify this state based on the user's input. If the user doesn't specify a new word, keep the curernt word. Otherwise, change all arguments and get as creative as possible with all arguments.`,
                },
                { role: 'user', content: prompt },
            ],
            functions: [functionSchema],
            function_call: { name: 'createText' },
        });

        console.log(completion);

        const response = completion.choices[0]?.message?.function_call;
        console.log('Response:', response);

        // Safeguard for invalid responses
        if (!response || !response.arguments) {
            console.error('Invalid function_call response:', response);

            // Return the current state as fallback
            return res.status(400).json({
                error: 'The model did not return a valid function call. Reusing the current state.',
                response: currentState,
            });
        }

        // Parse the response and update the current state
        const newState = JSON.parse(response.arguments);

        // Update only the parameters specified in the response
        currentState = { ...currentState, ...newState };

        res.json({ response: currentState });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
