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
    backgroundColor: '#000000',

    // Animation parameters
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    rotateXEnabled: false,
    rotateYEnabled: false,
    rotateZEnabled: false,

    // Scale/Pulse parameters
    scaleEnabled: false,
    scaleSpeed: 0.02,
    scaleMin: 0.8,
    scaleMax: 1.2
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
                description: 'Update ONLY if user specifically asks to change the font (options if text is in english: helvetiker, optimer, gentilis. options if text is in hebrew: haim.)' 
            },
            color: { 
                type: 'string', 
                description: 'Update ONLY if user specifically mentions text color or material color (hexadecimal e.g., #ff0000)' 
            },
            height: {
                type: 'number',
                description: 'The depth/thickness of the 3D text (range: 0.1-5)',
                minimum: 0.1,
                maximum: 5
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
            },
            // Rotation parameters
            rotateX: {
                type: 'number',
                description: 'X-axis rotation speed (-0.1 to 0.1)',
                minimum: -0.1,
                maximum: 0.1
            },
            rotateXEnabled: {
                type: 'boolean',
                description: 'Enable/disable X-axis rotation'
            },
            rotateY: {
                type: 'number',
                description: 'Y-axis rotation speed (-0.1 to 0.1)',
                minimum: -0.1,
                maximum: 0.1
            },
            rotateYEnabled: {
                type: 'boolean',
                description: 'Enable/disable Y-axis rotation'
            },
            rotateZ: {
                type: 'number',
                description: 'Z-axis rotation speed (-0.1 to 0.1)',
                minimum: -0.1,
                maximum: 0.1
            },
            rotateZEnabled: {
                type: 'boolean',
                description: 'Enable/disable Z-axis rotation'
            },
            // Scale/Pulse parameters
            scaleEnabled: {
                type: 'boolean',
                description: 'Enable/disable scale/pulse animation'
            },
            scaleSpeed: {
                type: 'number',
                description: 'Speed of scale/pulse animation (0.01 to 0.1)',
                minimum: 0.01,
                maximum: 0.1
            },
            scaleMin: {
                type: 'number',
                description: 'Minimum scale factor (0.5 to 1)',
                minimum: 0.5,
                maximum: 1
            },
            scaleMax: {
                type: 'number',
                description: 'Maximum scale factor (1 to 2)',
                minimum: 1,
                maximum: 2
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

Guidelines for Animations:
1. Rotation Animation:
   - When user mentions rotation, set appropriate speeds and enable relevant axes
   - Use smaller values (0.01-0.03) for slower rotation, larger (0.05-0.1) for faster
   - For "spin" or "rotate" without direction, default to Y-axis
   - When user mentions specific axes, enable only those axes
   - When user says "stop" or "stop spinning", disable all rotations

2. Scale/Pulse Animation:
   - Respond to words like "pulse", "breathe", "throb", "scale", "grow"
   - For gentle pulse: scaleSpeed: 0.02, scaleMin: 0.9, scaleMax: 1.1
   - For dramatic pulse: scaleSpeed: 0.05, scaleMin: 0.7, scaleMax: 1.3
   - "Fast pulse" increases scaleSpeed (0.05-0.1)
   - "Slow pulse" decreases scaleSpeed (0.01-0.02)
   - "Stop pulsing" sets scaleEnabled to false

Examples:
- "make it pulse slowly" → scaleEnabled: true, scaleSpeed: 0.01
- "make it throb dramatically" → scaleEnabled: true, scaleSpeed: 0.05, scaleMin: 0.7, scaleMax: 1.3
- "stop all animations" → disable both rotation and scale
- "spin and pulse" → enable both rotation and scale with moderate speeds
- "pulse subtly" → gentle pulse settings
- "make it breathe naturally" → moderate pulse settings

Remember to:
- ONLY change parameters that the user specifically mentions
- Keep all other parameters unchanged from their current values
- Consider natural language variations for animation requests
- Pay attention to speed and intensity modifiers`;

module.exports = {
    defaultState,
    functionSchema,
    systemPrompt
};