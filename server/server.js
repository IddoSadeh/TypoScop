const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const { defaultState, functionSchema, systemPrompt } = require('./config/parameters.js');

dotenv.config();

const app = express();
const port = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/fonts', express.static(path.join(__dirname, '../public/fonts'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        }
    },
    // Enable file names with spaces
    fallthrough: true
}));


// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Current state
let currentState = { ...defaultState };

app.post('/api/customize', async (req, res) => {
    const { prompt } = req.body;

    // Log the current state and user prompt
    console.log('\n=== New Request ===');
    console.log('User Prompt:', prompt);
    console.log('Current State:', currentState);

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `${systemPrompt}
                    Current state:
                    ${Object.entries(currentState).map(([key, value]) => `${key}: ${value}`).join('\n')}`
                },
                { role: 'user', content: prompt }
            ],
            functions: [functionSchema],
            function_call: { name: 'updateText' }
        });

        const response = completion.choices[0]?.message?.function_call;

        if (!response || !response.arguments) {
            console.log('Error: Invalid response from AI model');
            return res.status(400).json({
                error: 'Invalid response from AI model',
                response: currentState
            });
        }

        // Log the raw response from OpenAI
        console.log('\nOpenAI Response:');
        console.log(JSON.stringify(completion.choices[0].message, null, 2));

        const newState = JSON.parse(response.arguments);
        
        // Log which parameters are being changed
        console.log('\nParameters being updated:');
        Object.entries(newState).forEach(([key, value]) => {
            console.log(`${key}: ${currentState[key]} -> ${value}`);
        });

        // Update current state
        currentState = { ...currentState, ...newState };
        
        // Log final state
        console.log('\nFinal State:', currentState);
        console.log('=== End Request ===\n');

        res.json({ response: currentState });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});