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
                description: 'Update ONLY if user specifically mentions text color or material color (hexadecimal e.g., #ff0000). Default: #ffffff'
            },
            height: {
                type: 'number',
                description: 'The depth/thickness of the 3D text (range: 0.1-5). Default: 1.0',
                minimum: 0.1,
                maximum: 5
            },
            metalness: {
                type: 'number',
                description: 'Update ONLY if user mentions metallic quality or shininess (range: 0-1). Default: 0',
                minimum: 0,
                maximum: 1
            },
            roughness: {
                type: 'number',
                description: 'Update ONLY if user mentions texture roughness or smoothness (range: 0-1). Default: 0.5',
                minimum: 0,
                maximum: 1
            },
            backgroundColor: {
                type: 'string',
                description: 'Update ONLY if user specifically mentions background or scene color (hexadecimal). Default: #000000'
            },
            scrambleEnabled: {
                type: 'boolean',
                description: 'Enable/disable letter scramble animation. Default: false'
            },
            scrambleSpeed: {
                type: 'number',
                description: 'Speed of scramble animation (0.1 to 2.0). Default: 1.0',
                minimum: 0.1,
                maximum: 2.0
            },
            scrambleIntensity: {
                type: 'number',
                description: 'Intensity of scramble movement (0.1 to 3.0). Default: 1.0',
                minimum: 0.1,
                maximum: 3.0
            },
            scrambleMode: {
                type: 'string',
                description: 'Type of scramble animation pattern. Default: random',
                enum: ['random', 'swap', 'circular']
            },
            multiTextEnabled: {
                type: 'boolean',
                description: 'Enable/disable multiple copies of the text. Default: false'
            },
            copyCount: {
                type: 'integer',
                description: 'Number of text copies to create (1-10). Default: 1',
                minimum: 1,
                maximum: 10
            },
            spread: {
                type: 'number',
                description: 'How far apart the copies should be spread (10-100). Default: 50',
                minimum: 10,
                maximum: 100
            },
            tessellationEnabled: {
                type: 'boolean',
                description: 'Enable/disable tessellation effect. Default: false'
            },
            tessellationSegments: {
                type: 'integer',
                description: 'Number of segments for tessellation (1-20). Default: 8',
                minimum: 1,
                maximum: 50
            },
            wireframeEnabled: {
                type: 'boolean',
                description: 'Enable/disable wireframe effect. Default: false'
            },
            wireframeOpacity: {
                type: 'number',
                description: 'Opacity of wireframe effect (0.1-1.0). Default: 0.3',
                minimum: 0.1,
                maximum: 1.0
            },
            colorHueStart: {
                type: 'number',
                description: 'Base hue for color patterns (0-1). Default: 0',
                minimum: 0,
                maximum: 1
            },
            colorHueRange: {
                type: 'number',
                description: 'Range of hue variation (0-1). Default: 0.2',
                minimum: 0,
                maximum: 1
            },
            colorSatStart: {
                type: 'number',
                description: 'Base saturation for color patterns (0-1). Default: 0.5',
                minimum: 0,
                maximum: 1
            },
            colorSatRange: {
                type: 'number',
                description: 'Range of saturation variation (0-1). Default: 0.5',
                minimum: 0,
                maximum: 1
            },
            colorLightStart: {
                type: 'number',
                description: 'Base lightness for color patterns (0-1). Default: 0.5',
                minimum: 0,
                maximum: 1
            },
            colorLightRange: {
                type: 'number',
                description: 'Range of lightness variation (0-1). Default: 0.3',
                minimum: 0,
                maximum: 1
            },
            colorPattern: {
                type: 'string',
                description: 'Pattern type for color variations. Default: random',
                enum: ['random', 'gradient', 'waves']
            },
            manipulationAnimationEnabled: {
                type: 'boolean',
                description: 'Enable/disable animation for active manipulation effect. Default: false'
            },
            manipulationAnimationSpeed: {
                type: 'number',
                description: 'Speed of manipulation animation (0.1-2.0). Default: 0.5',
                minimum: 0.1,
                maximum: 2.0
            },
            manipulationAnimationIntensity: {
                type: 'number',
                description: 'Intensity of manipulation animation (0.1-3.0). Default: 1.0',
                minimum: 0.1,
                maximum: 3.0
            },
            particlesEnabled: {
                type: 'boolean',
                description: 'Enable or disable particle material rendering. Default: false'
            },
            particleShape: {
                type: 'string',
                description: 'Shape of individual particles; choose between "sphere", "cube", or "torus". Default: sphere',
                enum: ['sphere', 'cube', 'torus']
            },
            particleSize: {
                type: 'number',
                description: 'Base size multiplier for particle geometry. Default: 1.0',
                minimum: 0.1,
                maximum: 10
            },
            particleDensity: {
                type: 'number',
                description: 'Density factor for sampling particles from the text geometry. Default: 1.0',
                minimum: 0.1,
                maximum: 3
            },
            particleRandomness: {
                type: 'number',
                description: 'Randomness factor for particle distribution (0 to 1). Default: 0.5',
                minimum: 0,
                maximum: 1
            },
            particleScale: {
                type: 'number',
                description: 'Uniform scale factor applied to each particle instance. Default: 1.0',
                minimum: 0.1,
                maximum: 10
            },
            backgroundOpacity: {
                type: 'number',
                description: 'Background opacity (0-1). Default: 1.0',
                minimum: 0,
                maximum: 1
            },
            fogEnabled: {
                type: 'boolean',
                description: 'Enable/disable fog effect. Default: false'
            },
            fogColor: {
                type: 'string',
                description: 'Color of the fog effect (hexadecimal). Default: #000000'
            },
            fogDensity: {
                type: 'number',
                description: 'Density of the fog effect (0-1). Default: 0.1',
                minimum: 0,
                maximum: 1
            },
            ambientLightIntensity: {
                type: 'number',
                description: 'Intensity of ambient lighting (0-1). Default: 0.5',
                minimum: 0,
                maximum: 1
            },
            mainLightIntensity: {
                type: 'number',
                description: 'Intensity of main directional light (0-1). Default: 0.8',
                minimum: 0,
                maximum: 1
            },
            fillLightIntensity: {
                type: 'number',
                description: 'Intensity of fill light (0-1). Default: 0.5',
                minimum: 0,
                maximum: 1
            },
            cameraDistance: {
                type: 'number',
                description: 'Camera distance from scene (10-100). Default: 30',
                minimum: 0,
                maximum: 100
            },
            fieldOfView: {
                type: 'number',
                description: 'Camera field of view in degrees (30-120). Default: 45',
                minimum: 0,
                maximum: 120
            },
            scenePositionX: {
                type: 'number',
                description: 'Horizontal position of the scene (-50 to 50). Default: 0',
                minimum: -50,
                maximum: 50
            },
            scenePositionY: {
                type: 'number',
                description: 'Vertical position of the scene (-50 to 50). Default: 0',
                minimum: -50,
                maximum: 50
            },
            textSize: {
                type: 'number',
                description: 'Size of the text (1-10). Default: 5',
                minimum: 1,
                maximum: 10
            },
            letterSpacing: {
                type: 'number',
                description: 'Spacing between letters (0-2). Default: 0.5',
                minimum: 0,
                maximum: 2
            },
            curveSegments: {
                type: 'integer',
                description: 'Number of curve segments for text geometry (4-32). Default: 12',
                minimum: 4,
                maximum: 32
            },
            bevelEnabled: {
                type: 'boolean',
                description: 'Enable/disable bevel effect on text. Default: true'
            },
            bevelThickness: {
                type: 'number',
                description: 'Thickness of bevel effect (0-1). Default: 0.15',
                minimum: 0,
                maximum: 1
            },
            bevelSize: {
                type: 'number',
                description: 'Size of bevel effect (0-1). Default: 0.3',
                minimum: 0,
                maximum: 1
            },
            bevelSegments: {
                type: 'integer',
                description: 'Number of bevel segments (1-10). Default: 5',
                minimum: 1,
                maximum: 10
            },
            projectionEnabled: {
                type: 'boolean',
                description: 'Enable/disable projection effect. Default: false'
            },
            projectionType: {
                type: 'string',
                description: 'Type of projection to use. Default: standard',
                enum: ['standard', 'pattern']
            },
            projectionMode: {
                type: 'string',
                description: 'Shape to project onto. Default: torusknot',
                enum: ['torusknot', 'donut', 'sphere', 'cube', 'cylinder', 'cone', 'octahedron']
            },
            projectionScale: {
                type: 'number',
                description: 'Scale of the projection (0.1-3). Default: 1.0',
                minimum: 0.1,
                maximum: 3
            },
            patternAnimatePattern: {
                type: 'boolean',
                description: 'Enable/disable pattern animation. Default: true'
            },
            patternAnimationDirection: {
                type: 'string',
                description: 'Direction of pattern animation. Default: vertical',
                enum: ['vertical', 'horizontal', 'diagonal']
            },
            patternAnimationSpeed: {
                type: 'number',
                description: 'Speed of pattern animation (0.001-0.05). Default: 0.009',
                minimum: 0.001,
                maximum: 0.05
            },
            patternAnimationReverse: {
                type: 'boolean',
                description: 'Reverse pattern animation direction. Default: false'
            },
            patternRepeatX: {
                type: 'integer',
                description: 'Horizontal pattern repetitions (1-20). Default: 4',
                minimum: 1,
                maximum: 20
            },
            patternRepeatY: {
                type: 'integer',
                description: 'Vertical pattern repetitions (1-20). Default: 4',
                minimum: 1,
                maximum: 20
            },
            patternLetterSpacing: {
                type: 'number',
                description: 'Letter spacing in pattern (0-2). Default: 0.5',
                minimum: 0,
                maximum: 2
            },
            patternWordSpacing: {
                type: 'number',
                description: 'Word spacing in pattern (0.5-3). Default: 1.0',
                minimum: 0.5,
                maximum: 3
            },
            patternBackgroundColor: {
                type: 'string',
                description: 'Background color for pattern (hexadecimal). Default: #000000'
            },
            patternTextColor: {
                type: 'string',
                description: 'Text color in pattern (hexadecimal). Default: #ffffff'
            },
            patternOpacity: {
                type: 'number',
                description: 'Opacity of pattern (0-1). Default: 1.0',
                minimum: 0,
                maximum: 1
            }
        },
        required: [],
        additionalProperties: false
    }
};

const systemPrompt = `
You can change any number of parameters to capture the users prompt. 
Be tasteful in your choice of arguments. More is not always better. 

Instructions:

If the projection is enabled PLEASE:
- DISABLE letter scramble, manipulations, particles, tesselation
-  projectiontype = pattern!!!

ONLY one of the manipulations (wireframe, tesselation, particle) can be enabled at once. 

If a user asks to make the scene "more X" or "less X" (where X is scary/psychedelic/calm/other):
- Look at the corresponding scene preset below
- If making it "more X", increase relevant parameters towards the preset values
- If making it "less X", decrease relevant parameters away from the preset values
- Never exceed the maximum values shown in the presets
- Maintain smooth transitions - don't jump directly to preset values
- Consider current parameter differences when making adjustments
- Feel free to change other parameters as needed

This is a scary scene:
  "projectionEnabled": false,
    "height": 10,
    "letterSpacing": 0,
    "color": "#a80000",
    "metalness": 1,
    "roughness": 0.6,
    "fogEnabled": true,
    "fogDensity": 0.5,
    "ambientLightIntensity": 1,
    "mainLightIntensity": 1,
    "fillLightIntensity": 1,
    "cameraDistance": 29,
    "fieldOfView": 48,
    "position": {
      "x": -17,
      "y": 0,
      "z": 0
    },
    "rotateZ": -0.001,
    "scaleSpeed": 0.01,
    "scaleMin": 1,
    "scaleMax": 2,
    "multiTextEnabled": true,
    "copyCount": 10,
    "spread": 30,

Scary characteristics to adjust gradually:
- Darker red colors (shift color towards #660000)
- Higher fog density
- Slower, unsettling rotations
- More copies with wider spread
- Larger scale ranges
- Higher metalness

This is a psychedelic scene:
    "backgroundColor": "#65af64",
    "fogEnabled": true,
    "fogColor": "#ffcb0f",
    "ambientLightIntensity": 1,
    "mainLightIntensity": 1,
    "fillLightIntensity": 1,
    "cameraDistance": 21,
    "position": {
      "x": 3,
      "y": -2,
      "z": 0
    },
    "multiTextEnabled": true,
    "copyCount": 10,
    "spread": 20,
    "projectionEnabled": true,
    "projectionType": "pattern",
    "mode": "donut",
    "animationDirection": "diagonal",
    "animationSpeed": 0.01,
    "animationReverse": true,
    "repeatX": 3,
    "repeatY": 1,
    "letterSpacing": 0.1,
    "wordSpacing": 0.5,
    "backgroundColor": "#570553",
    "textColor": "#00fbff",

Psychedelic characteristics to adjust gradually:
- More vibrant contrasting colors
- Faster animation speeds
- More copies with wider spread
- More pattern repetitions
- Enable additional rotations
- Increase animation complexity

This is a calm scene:
    "projectionEnabled": false,
    "color": "#00ffee",
    "particlesEnabled": true,
    "particleSize": 0.02,
    "particleDensity": 0.2,
    "particleRandomness": 0.45,
    "particleShape": "torus",
    "manipulationAnimationEnabled": true,
    "manipulationAnimationSpeed": 0.1,
    "manipulationAnimationIntensity": 3,
    "basicMaterialColor": "#00ffee",
    "backgroundColor": "#dedede",

Calm characteristics to adjust gradually:
- Softer blue/teal colors
- Lower particle density
- Slower animation speeds
- Reduced manipulation intensity
- Fewer copies
- More neutral backgrounds
- Lower particle size


Example Inputs and outputs:
A radioactive cluster spreading in an organic, uncontrolled manner. The dark green, glowing surface gives off a toxic, biohazard-like energy, resembling a mutation or an alien infection consuming the digital space. It appears unstable, pulsing with dangerous energy.:
  Make a radioactive cluster effect with these exact parameters:
- make sure projection is disabled
- make sure pulse is off
- Set text height to 10 and letter spacing to 4.3
- Use bright neon green color (#82ff05) for the text with no metalness or roughnes.
- Enable particles:
* Set particle size to 1
* Use sphere shape
* Set density to 1
* Low randomness (0.1)
* Enable manipulation animation with speed 0.1 and high intensity (3)
- Set background to radioactive green (#0aae15)
- Position scene slightly to the left and down (x: 0, y: -3)

Glowing letters scattered over a fiery red background, crackling with neon-like energy. Chaotic, flickering, and full of motion—like electric sparks or a digital punk aesthetic.:
- Disable particle
- Disable Tesselation
- Disable projection
- Set text height to 9.9 with no letter spacing
- Use bright yellow color (#e1ff00) with high metalness (0.7) and roughness (0.7)
- Enable wireframe effect:
  * Set wireframe opacity to 0.8
  * Enable manipulation animation with speed 0.4 and intensity 3
- Set background to deep red (#940000)
- Enable ONLY the following effects:
  * Turn on scramble animation with speed 0.7 and intensity 3
  * Set scramble mode to "circular"
  * Enable multiple copies (7) with spread of 50


A futuristic, floating architectural structure suspended in space. The design consists of sharp, jagged geometric forms that appear to be breaking apart or assembling dynamically.:
    -"tessellationEnabled": true,
    -"wireframeEnabled": false,
    -"particlesEnabled": false,
    - Disable projection
- Set text height to 10 with letter spacing 0.8
- Use metallic grey color (#b3b3b3) with very high metalness (0.9) and low roughness (0.3)
- Enable tessellation:
  * Set segments to 1
  * Enable manipulation animation with speed 0.2 and intensity 3
- Set background to light grey (#adadad)
- Position scene far left (x: -29)
- Enable multiple copies (10) with wide spread (80)

Text morphing into fluid, organic forms, appearing as if it is melting or stretching in a surreal liquid-like motion. It flows dynamically, reacting to movement as if suspended in an unseen gravitational field.:
    -"tessellationEnabled": false,
    -"wireframeEnabled": false,
    -"particlesEnabled": false,
    -"scrambleEnabled": false,
- Set text color to light blue (#80c1ff)
- Enable projection with these settings:
  * Type: pattern
  * Mode: torusknot
  * Animation direction: diagonal
  * Slow animation speed (0.003)
  * High repetition (20x10)
  * Dark background color (#140000)
  * 50% opacity
- Set scene background to deep red (#510606)
- Enable fog:
  * Warm fog color (#fff4e5)
  * High density (0.44)
- Set camera closer (distance: 19)
- Position scene center(x: 0)
- High ambient light (0.8)

A cascading wall of text resembling digital rainfall, creating an immersive, hypnotic effect. The letters blur as they descend, mimicking the aesthetic of heavy rain in a cybernetic world.:
- "tessellationEnabled": false
- "wireframeEnabled": false
- "particlesEnabled": false
- "scrambleEnabled": false
- "multiTextEnabled": false
- Use deep blue color (#01105b)
- Enable projection:
  * Type: pattern
  * Mode: cube
  * Animation direction: diagonal
  * Animation speed: 0.005
  * Reverse animation enabled
  * Wide letter spacing (2) and word spacing (3)
  * Dark blue background (#00000a)
  * 80% opacity
- Set scene background to black
- Enable fog with yellow tint (#fff824)
- Make camera very close with these exact settings:
  * Set text size to 3
  * Set text height to 1.5
- Stretch pattern horizontally (20x1 repetition)

Remember to consider the current parameter differences provided in each request when making adjustments.
`;

module.exports = {
    defaultState,
    functionSchema,
    systemPrompt
};