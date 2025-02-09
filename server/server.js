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
    fallthrough: true
}));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let currentState = { ...defaultState };

// Function to get differences between current state and default state
function getStateDifferences() {
    const differences = [];
    for (const [key, value] of Object.entries(currentState)) {
        if (JSON.stringify(value) !== JSON.stringify(defaultState[key])) {
            differences.push(`${key}: ${JSON.stringify(defaultState[key])} -> ${JSON.stringify(value)}`);
        }
    }
    return differences;
}

app.post('/api/customize', async (req, res) => {
    const { prompt } = req.body;

    console.log('\n=== New Request ===');
    console.log('User Prompt:', prompt);
    console.log('Current State:', currentState);

    // Get current differences from default state
    const differences = getStateDifferences();
    const differenceText = differences.length > 0 
        ? `\nCurrent parameters that differ from default:\n${differences.join('\n')}`
        : '\nAll parameters are currently at their default values.';

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `${systemPrompt}
                    ${differenceText}
                    
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

        console.log('\nOpenAI Response:');
        console.log(JSON.stringify(completion.choices[0].message, null, 2));

        const newState = JSON.parse(response.arguments);
        
        const changes = [];
        Object.entries(newState).forEach(([key, value]) => {
            changes.push(`${key}: ${currentState[key]} -> ${value}`);
        });

        currentState = { ...currentState, ...newState };
        
        console.log('\nFinal State:', currentState);
        console.log('=== End Request ===\n');

        res.json({
            response: currentState,
            changes: changes
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});