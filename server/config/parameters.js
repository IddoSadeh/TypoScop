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
    rotateZEnabled: false
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
- Do not change any parameters unless explicitly requested by the user

Guidelines for Rotation Animation:
- When user mentions rotation, set appropriate rotation speeds and enable the relevant axes
- Use smaller values (0.01-0.03) for slower rotation, larger values (0.05-0.1) for faster rotation
- For "spin" or "rotate" without direction, default to Y-axis rotation
- When user mentions specific axes, enable only those axes
- When user says "stop" or "stop spinning", disable all rotations (set enabled to false)
- Keep all unmentioned parameters unchanged

Examples:
- "make it spin" → set rotateY: 0.03, rotateYEnabled: true
- "rotate faster" → increase current rotation speeds by ~2x
- "spin on all axes" → enable all axes with moderate speed (0.03)
- "stop rotation" → set all rotation enabled flags to false
- "rotate on x and z" → enable only X and Z rotation
- "spin slowly" → set lower speed values (0.01)
- "spin very fast" → set higher speed values (0.08-0.1)

Remember to:
- ONLY change parameters that the user specifically mentions
- Keep all other parameters unchanged from their current values
- Consider words like "spin", "rotate", and "turn" as rotation requests
- Pay attention to speed modifiers (slowly, quickly, faster, etc.)
`;

module.exports = {
    defaultState,
    functionSchema,
    systemPrompt
};