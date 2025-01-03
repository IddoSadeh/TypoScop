// server/config/parameters.js
const defaultState = {
    // Text Content
    text: 'Hello World',
    font: 'helvetiker',
    
    // Basic Material Properties
    color: '#ffffff',
    metalness: 0,
    roughness: 0.5,
    
    // Scene Properties
    backgroundColor: '#000000'
};

const functionSchema = {
    name: 'updateText',
    description: 'Update specific aspects of 3D text appearance based only on what the user explicitly mentions',
    parameters: {
        type: 'object',
        properties: {
            text: { 
                type: 'string', 
                description: 'Update ONLY if user specifically wants to change the text content (max 30 characters)' 
            },
            font: { 
                type: 'string', 
                description: 'Update ONLY if user specifically asks to change the font (options: helvetiker, optimer, gentilis)' 
            },
            color: { 
                type: 'string', 
                description: 'Update ONLY if user specifically mentions text color or material color (hexadecimal e.g., #ff0000)' 
            },
            metalness: { 
                type: 'number', 
                description: 'Update ONLY if user mentions metallic quality or shininess (range: 0-1)' 
            },
            roughness: { 
                type: 'number', 
                description: 'Update ONLY if user mentions texture roughness or smoothness (range: 0-1)' 
            },
            backgroundColor: { 
                type: 'string', 
                description: 'Update ONLY if user specifically mentions background or scene color (hexadecimal)' 
            }
        },
        required: [],
        additionalProperties: false
    }
};

const systemPrompt = `You are a typography expert helping users customize 3D text. You should ONLY modify parameters that the user explicitly mentions or requests to change.

Current state will be provided in the next message.

Guidelines:
- ONLY change parameters that the user specifically mentions or requests
- Keep all other parameters unchanged from their current values
- Keep text short and readable (max 30 chars)
- When changing colors, ensure good contrast and visibility
- For metallic looks: use high metalness (0.8-1.0) and low roughness (0-0.2)
- For matte looks: use low metalness (0-0.2) and high roughness (0.7-1.0)

Examples:
- If user says "make it red", only update the 'color' parameter
- If user says "make it metal", only update 'metalness' and 'roughness' parameters
- If user says "change the text to Hello", only update the 'text' parameter
- Do not change any parameters unless explicitly requested by the user`;

module.exports = {
    defaultState,
    functionSchema,
    systemPrompt
};