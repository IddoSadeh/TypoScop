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
    scaleMax: 1.2,

    tessellationEnabled: false,
    tessellationSegments: 8,
    tessellationHueStart: 0,
    tessellationHueRange: 0.2,
    tessellationSatStart: 0.5,
    tessellationSatRange: 0.5,
    tessellationLightStart: 0.5,
    tessellationLightRange: 0.3,
    tessellationPattern: 'random'
};

const functionSchema = {
    name: 'updateText',
    description: 'Update specific aspects of 3D text appearance based only on what the user explicitly mentions',
    parameters: {
        type: 'object',
        properties: {
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
            },
            scrambleEnabled: {
                type: 'boolean',
                description: 'Enable/disable letter scramble animation'
            },
            scrambleSpeed: {
                type: 'number',
                description: 'Speed of scramble animation (0.1 to 2.0)',
                minimum: 0.1,
                maximum: 2.0
            },
            scrambleIntensity: {
                type: 'number',
                description: 'Intensity of scramble movement (0.1 to 3.0)',
                minimum: 0.1,
                maximum: 3.0
            },
            scrambleMode: {
                type: 'string',
                description: 'Type of scramble animation pattern',
                enum: ['random', 'swap', 'circular']
            },
            multiTextEnabled: {
                type: 'boolean',
                description: 'Enable/disable multiple copies of the text'
            },
            copyCount: {
                type: 'integer',
                description: 'Number of text copies to create (1-10)',
                minimum: 1,
                maximum: 10
            },
            spread: {
                type: 'number',
                description: 'How far apart the copies should be spread (10-100)',
                minimum: 10,
                maximum: 100
            },
              // Tessellation properties
              tessellationEnabled: {
                type: 'boolean',
                description: 'Enable/disable tessellation effect'
            },
            tessellationSegments: {
                type: 'integer',
                description: 'Number of segments for tessellation (1-20)',
                minimum: 1,
                maximum: 50
            },
            tessellationHueStart: {
                type: 'number',
                description: 'Base hue for tessellation colors (0-1)',
                minimum: 0,
                maximum: 1
            },
            tessellationHueRange: {
                type: 'number',
                description: 'Range of hue variation (0-1)',
                minimum: 0,
                maximum: 1
            },
            tessellationSatStart: {
                type: 'number',
                description: 'Base saturation for tessellation colors (0-1)',
                minimum: 0,
                maximum: 1
            },
            tessellationSatRange: {
                type: 'number',
                description: 'Range of saturation variation (0-1)',
                minimum: 0,
                maximum: 1
            },
            tessellationLightStart: {
                type: 'number',
                description: 'Base lightness for tessellation colors (0-1)',
                minimum: 0,
                maximum: 1
            },
            tessellationLightRange: {
                type: 'number',
                description: 'Range of lightness variation (0-1)',
                minimum: 0,
                maximum: 1
            },
            tessellationPattern: {
                type: 'string',
                description: 'Pattern type for tessellation colors',
                enum: ['random', 'gradient', 'waves']
            },
            tessellationAnimationEnabled: {
                type: 'boolean',
                description: 'Enable/disable tessellation animation'
            },
            tessellationAnimationSpeed: {
                type: 'number',
                description: 'Speed of tessellation animation (0.1-2.0)',
                minimum: 0.1,
                maximum: 2.0
            },
            tessellationAnimationIntensity: {
                type: 'number',
                description: 'Intensity of tessellation animation (0.1-3.0)',
                minimum: 0.1,
                maximum: 3.0
            }
        },
        required: [],
        additionalProperties: false
    }
};

const systemPrompt = `You are a typography expert helping users customize 3D text. You can change any number of parameters to accuratley capture the users prompt. `;

// You should ONLY modify parameters that the user explicitly mentions or requests to change.

// Current state will be provided in the next message.

// Guidelines:
// - ONLY change parameters that the user specifically mentions or requests
// - Keep all other parameters unchanged from their current values
// - Keep text short and readable (max 30 chars)
// - When changing colors, ensure good contrast and visibility
// - For metallic looks: use high metalness (0.8-1.0) and low roughness (0-0.2)
// - For matte looks: use low metalness (0-0.2) and high roughness (0.7-1.0)

// Guidelines for Animations:
// 1. Rotation Animation:
//    - When user mentions rotation, set appropriate speeds and enable relevant axes
//    - Use smaller values (0.01-0.03) for slower rotation, larger (0.05-0.1) for faster
//    - For "spin" or "rotate" without direction, default to Y-axis
//    - When user mentions specific axes, enable only those axes
//    - When user says "stop" or "stop spinning", disable all rotations

// 2. Scale/Pulse Animation:
//    - For gentle pulse: scaleSpeed: 0.02, scaleMin: 0.9, scaleMax: 1.1
//    - For dramatic pulse: scaleSpeed: 0.05, scaleMin: 0.7, scaleMax: 1.3
//    - "Fast pulse" increases scaleSpeed (0.05-0.1)
//    - "Slow pulse" decreases scaleSpeed (0.01-0.02)

// 3. Scramble Animation:
//    - Responds to words like "scramble", "scatter", "chaos", "randomize"
//    - Random mode: Letters move randomly (default)
//    - Swap mode: Letters swap positions in pairs
//    - Circular mode: Letters move in circular patterns
//    - Use intensity 0.5-1.0 for subtle movement, 1.5-3.0 for dramatic
//    - Speed 0.1-0.5 for slow movement, 1.0-2.0 for fast
// 4. Multiple Text Copies:
// - When user mentions "copies", "duplicate", or "multiply", enable multiTextEnabled
// - Number words like "three", "few", "many" should adjust copyCount appropriately
// - Words about spacing like "spread out", "close", "far" adjust the spread parameter
// - Phrases like "different speeds", "unique rotation" enable rotateIndependently
// - Default values: 3 copies, spread of 50 units
// - Maximum of 10 copies to maintain performance
// - When user says "single" or "remove copies", disable multiTextEnabled


// Examples:
// - "make it pulse slowly" → scaleEnabled: true, scaleSpeed: 0.01
// - "make it throb dramatically" → scaleEnabled: true, scaleSpeed: 0.05, scaleMin: 0.7, scaleMax: 1.3
// - "stop all animations" → disable both rotation and scale
// - "spin and pulse" → enable both rotation and scale with moderate speeds
// - "pulse subtly" → gentle pulse settings
// - "make it breathe naturally" → moderate pulse settings
// - "scramble the letters" → scrambleEnabled: true, scrambleMode: 'random', scrambleIntensity: 1.0
// - "scatter letters chaotically" → scrambleMode: 'random', scrambleIntensity: 2.0
// - "make letters swap places" → scrambleMode: 'swap'
// - "make letters move in a circle" → scrambleMode: 'circular'
// - "scramble faster" → increase scrambleSpeed
// - "scatter letters more widely" → increase scrambleIntensity
// - "stop scrambling" → scrambleEnabled: false
// - "make three copies" → multiTextEnabled: true, copyCount: 3
// - "create many copies spread far apart" → multiTextEnabled: true, copyCount: 8, spread: 90
// - "duplicate text with different rotations" → multiTextEnabled: true
// - "make it single again" → multiTextEnabled: false
// - "add 5 copies rotating differently" → multiTextEnabled: true, copyCount: 5


// Remember to:
// - ONLY change parameters that the user specifically mentions
// - Keep all other parameters unchanged from their current values
// - Consider natural language variations for animation requests
// - Pay attention to speed and intensity modifiers

module.exports = {
    defaultState,
    functionSchema,
    systemPrompt
};