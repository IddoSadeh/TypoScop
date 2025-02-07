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

    // Animation parameters (applies to all materials)
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

    // Manipulation parameters for tessellation and wireframe
    tessellationEnabled: false,
    tessellationSegments: 8,
    wireframeEnabled: false,
    wireframeOpacity: 0.3,

    // Unified color pattern parameters
    colorHueStart: 0,
    colorHueRange: 0.2,
    colorSatStart: 0.5,
    colorSatRange: 0.5,
    colorLightStart: 0.5,
    colorLightRange: 0.3,
    colorPattern: 'random',

    // Unified manipulation animation parameters
    manipulationAnimationEnabled: false,
    manipulationAnimationSpeed: 0.5,
    manipulationAnimationIntensity: 1.0,

    // ─ Particle–specific parameters ─
    particlesEnabled: false,       // Enable particle material rendering
    particleShape: 'sphere',       // Options: 'sphere', 'cube', 'torus'
    particleSize: 1.0,             // Base size multiplier for each particle
    particleDensity: 1.0,          // Density factor for sampling particles from the text geometry
    particleRandomness: 0.5,       // Randomness factor (0 to 1) for particle distribution (if used in your logic)
    particleScale: 1.0,             // Uniform scale factor applied to each particle instance

    // Additional Scene Properties
    backgroundOpacity: 1.0,
    fogEnabled: false,
    fogColor: '#000000',
    fogDensity: 0.1,
    ambientLightIntensity: 0.5,
    mainLightIntensity: 0.8,
    fillLightIntensity: 0.5,
    cameraDistance: 30,
    fieldOfView: 45,
    scenePositionX: 0,
    scenePositionY: 0,

    // Text Geometry Properties
    textSize: 5,
    letterSpacing: 0.5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.3,
    bevelSegments: 5,

    // Projection Properties
    projectionEnabled: false,
    projectionType: 'standard',
    projectionMode: 'torusknot',
    projectionScale: 1.0,
    projectionRepeat: 10,

    // Pattern Projection Properties
    patternEnabled: false,
    patternAnimatePattern: true,
    patternAnimationDirection: 'vertical',
    patternAnimationSpeed: 0.009,
    patternAnimationReverse: false,
    patternRepeatX: 4,
    patternRepeatY: 4,
    patternLetterSpacing: 0.5,
    patternWordSpacing: 1.0,
    patternBackgroundColor: '#000000',
    patternTextColor: '#ffffff',
    patternOpacity: 1.0
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
            // Wireframe properties
            wireframeEnabled: {
                type: 'boolean',
                description: 'Enable/disable wireframe effect'
            },
            wireframeOpacity: {
                type: 'number',
                description: 'Opacity of wireframe effect (0.1-1.0)',
                minimum: 0.1,
                maximum: 1.0
            },

            // Color pattern properties
            colorHueStart: {
                type: 'number',
                description: 'Base hue for color patterns (0-1)',
                minimum: 0,
                maximum: 1
            },
            colorHueRange: {
                type: 'number',
                description: 'Range of hue variation (0-1)',
                minimum: 0,
                maximum: 1
            },
            colorSatStart: {
                type: 'number',
                description: 'Base saturation for color patterns (0-1)',
                minimum: 0,
                maximum: 1
            },
            colorSatRange: {
                type: 'number',
                description: 'Range of saturation variation (0-1)',
                minimum: 0,
                maximum: 1
            },
            colorLightStart: {
                type: 'number',
                description: 'Base lightness for color patterns (0-1)',
                minimum: 0,
                maximum: 1
            },
            colorLightRange: {
                type: 'number',
                description: 'Range of lightness variation (0-1)',
                minimum: 0,
                maximum: 1
            },
            colorPattern: {
                type: 'string',
                description: 'Pattern type for color variations',
                enum: ['random', 'gradient', 'waves']
            },

            // Unified manipulation animation parameters
            manipulationAnimationEnabled: {
                type: 'boolean',
                description: 'Enable/disable animation for active manipulation effect'
            },
            manipulationAnimationSpeed: {
                type: 'number',
                description: 'Speed of manipulation animation (0.1-2.0)',
                minimum: 0.1,
                maximum: 2.0
            },
            manipulationAnimationIntensity: {
                type: 'number',
                description: 'Intensity of manipulation animation (0.1-3.0)',
                minimum: 0.1,
                maximum: 3.0
            },
            particlesEnabled: {
                type: 'boolean',
                description: 'Enable or disable particle material rendering'
            },
            particleShape: {
                type: 'string',
                description: 'Shape of individual particles; choose between "sphere", "cube", or "torus"',
                enum: ['sphere', 'cube', 'torus']
            },
            particleSize: {
                type: 'number',
                description: 'Base size multiplier for particle geometry',
                minimum: 0.1,
                maximum: 10
            },
            particleDensity: {
                type: 'number',
                description: 'Density factor for sampling particles from the text geometry',
                minimum: 0.1,
                maximum: 10
            },
            particleRandomness: {
                type: 'number',
                description: 'Randomness factor for particle distribution (0 to 1)',
                minimum: 0,
                maximum: 1
            },
            particleScale: {
                type: 'number',
                description: 'Uniform scale factor applied to each particle instance',
                minimum: 0.1,
                maximum: 10
            },
            // Scene Control Properties
            backgroundOpacity: {
                type: 'number',
                description: 'Background opacity (0-1)',
                minimum: 0,
                maximum: 1
            },
            fogEnabled: {
                type: 'boolean',
                description: 'Enable/disable fog effect'
            },
            fogColor: {
                type: 'string',
                description: 'Color of the fog effect (hexadecimal)'
            },
            fogDensity: {
                type: 'number',
                description: 'Density of the fog effect (0-1)',
                minimum: 0,
                maximum: 1
            },
            ambientLightIntensity: {
                type: 'number',
                description: 'Intensity of ambient lighting (0-1)',
                minimum: 0,
                maximum: 1
            },
            mainLightIntensity: {
                type: 'number',
                description: 'Intensity of main directional light (0-1)',
                minimum: 0,
                maximum: 1
            },
            fillLightIntensity: {
                type: 'number',
                description: 'Intensity of fill light (0-1)',
                minimum: 0,
                maximum: 1
            },
            cameraDistance: {
                type: 'number',
                description: 'Camera distance from scene (10-100)',
                minimum: 10,
                maximum: 100
            },
            fieldOfView: {
                type: 'number',
                description: 'Camera field of view in degrees (30-120)',
                minimum: 30,
                maximum: 120
            },
            scenePositionX: {
                type: 'number',
                description: 'Horizontal position of the scene (-50 to 50)',
                minimum: -50,
                maximum: 50
            },
            scenePositionY: {
                type: 'number',
                description: 'Vertical position of the scene (-50 to 50)',
                minimum: -50,
                maximum: 50
            },

            // Text Geometry Properties
            textSize: {
                type: 'number',
                description: 'Size of the text (1-10)',
                minimum: 1,
                maximum: 10
            },
            letterSpacing: {
                type: 'number',
                description: 'Spacing between letters (0-2)',
                minimum: 0,
                maximum: 2
            },
            curveSegments: {
                type: 'integer',
                description: 'Number of curve segments for text geometry (4-32)',
                minimum: 4,
                maximum: 32
            },
            bevelEnabled: {
                type: 'boolean',
                description: 'Enable/disable bevel effect on text'
            },
            bevelThickness: {
                type: 'number',
                description: 'Thickness of bevel effect (0-1)',
                minimum: 0,
                maximum: 1
            },
            bevelSize: {
                type: 'number',
                description: 'Size of bevel effect (0-1)',
                minimum: 0,
                maximum: 1
            },
            bevelSegments: {
                type: 'integer',
                description: 'Number of bevel segments (1-10)',
                minimum: 1,
                maximum: 10
            },

            // Projection Properties
            projectionEnabled: {
                type: 'boolean',
                description: 'Enable/disable projection effect'
            },
            projectionType: {
                type: 'string',
                description: 'Type of projection to use',
                enum: ['standard', 'pattern']
            },
            projectionMode: {
                type: 'string',
                description: 'Shape to project onto',
                enum: ['torusknot', 'donut', 'sphere', 'cube', 'cylinder', 'cone', 'octahedron']
            },
            projectionScale: {
                type: 'number',
                description: 'Scale of the projection (0.1-3)',
                minimum: 0.1,
                maximum: 3
            },

            // Pattern Projection Properties
            patternAnimatePattern: {
                type: 'boolean',
                description: 'Enable/disable pattern animation'
            },
            patternAnimationDirection: {
                type: 'string',
                description: 'Direction of pattern animation',
                enum: ['vertical', 'horizontal', 'diagonal']
            },
            patternAnimationSpeed: {
                type: 'number',
                description: 'Speed of pattern animation (0.001-0.05)',
                minimum: 0.001,
                maximum: 0.05
            },
            patternAnimationReverse: {
                type: 'boolean',
                description: 'Reverse pattern animation direction'
            },
            patternRepeatX: {
                type: 'integer',
                description: 'Horizontal pattern repetitions (1-20)',
                minimum: 1,
                maximum: 20
            },
            patternRepeatY: {
                type: 'integer',
                description: 'Vertical pattern repetitions (1-20)',
                minimum: 1,
                maximum: 20
            },
            patternLetterSpacing: {
                type: 'number',
                description: 'Letter spacing in pattern (0-2)',
                minimum: 0,
                maximum: 2
            },
            patternWordSpacing: {
                type: 'number',
                description: 'Word spacing in pattern (0.5-3)',
                minimum: 0.5,
                maximum: 3
            },
            patternBackgroundColor: {
                type: 'string',
                description: 'Background color for pattern (hexadecimal)'
            },
            patternTextColor: {
                type: 'string',
                description: 'Text color in pattern (hexadecimal)'
            },
            patternOpacity: {
                type: 'number',
                description: 'Opacity of pattern (0-1)',
                minimum: 0,
                maximum: 1
            }
        
        },
        required: [],
        additionalProperties: false
    }
};

const systemPrompt = `You are a typography expert helping users customize 3D text. You can change any number of parameters to capture the users prompt. Be tasteful in your choice of arguments. More is not always better. Try to make a symbiotic choice between parameters `;

module.exports = {
    defaultState,
    functionSchema,
    systemPrompt
};