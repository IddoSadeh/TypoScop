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

// Extended state object to include all parameters
let currentState = {
    // Text Geometry Parameters
    text: 'Hello, World!',
    size: 50,
    depth: 1,
    font: 'helvetiker',
    curveSegments: 12,
    bevelEnabled: false,
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelOffset: 0,
    bevelSegments: 3,

    // Standard Material Properties
    color: '#ffffff',
    metalness: 0,
    roughness: 0.5,
    wireframe: false,
    flatShading: false,
    
    // Physical Properties
    ior: 1.5,
    reflectivity: 0.5,
    transmission: 0,
    thickness: 0,

    // Clearcoat Properties
    clearcoat: 0,
    clearcoatRoughness: 0,
    
    // Sheen Properties
    sheen: 0,
    sheenRoughness: 1.0,
    sheenColor: '#000000',
    
    // Specular Properties
    specularIntensity: 1.0,
    specularColor: '#ffffff',
    
    // Anisotropy Properties
    anisotropy: 0,
    anisotropyRotation: 0,
    
    // Iridescence Properties
    iridescence: 0,
    iridescenceIOR: 1.3,
    
    // Emission Properties
    emissive: '#000000',
    emissiveIntensity: 0,
    
    // Common Material Properties
    opacity: 1,
    transparent: false,
    depthTest: true,
    depthWrite: true,
    alphaTest: 0,
    
    // Scene Properties
    backgroundColor: '#000000',
    fogEnabled: false,
    fogColor: '#3f7b9d',
    fogDensity: 0.1,
    
    // Camera Properties
    cameraDistance: 20,
    cameraHeight: 0,
    rotationSpeed: 0
};

app.post('/api/customize', async (req, res) => {
    const { prompt } = req.body;

    const functionSchema = {
        name: 'createText',
        description: 'Generate text with fully adjustable geometry, material, and scene parameters.',
        parameters: {
            type: 'object',
            properties: {
                // Text Content and Geometry
                text: { type: 'string', description: 'The text to display (max 30 characters)' },
                size: { type: 'number', description: 'Size of the text (range: 10-50)' },
                depth: { type: 'number', description: 'Thickness of the text (range: 1-20)' },
                font: { type: 'string', description: 'Font name (options: helvetiker, optimer, gentilis)' },
                curveSegments: { type: 'integer', description: 'Number of curves (range: 4-20)' },
                bevelEnabled: { type: 'boolean', description: 'Enable beveling' },
                bevelThickness: { type: 'number', description: 'Bevel thickness (range: 1-10)' },
                bevelSize: { type: 'number', description: 'Bevel size (range: 1-8)' },
    
                // Material Properties
                color: { type: 'string', description: 'Hexadecimal color (e.g., #ff5733)' },
                metalness: { type: 'number', description: 'Metallic quality (range: 0-1)' },
                roughness: { type: 'number', description: 'Surface roughness (range: 0-1)' },
                
                // Advanced Material Properties
                ior: { type: 'number', description: 'Index of refraction (range: 1-2.333)' },
                transmission: { type: 'number', description: 'Transmission/transparency (range: 0-1)' },
                clearcoat: { type: 'number', description: 'Clearcoat strength (range: 0-1)' },
                reflectivity: { type: 'number', description: 'Reflectivity (range: 0-1)' },
                specularIntensity: { type: 'number', description: 'Specular highlight intensity (range: 0-1)' },
                specularColor: { type: 'string', description: 'Hexadecimal color for specular highlights' },
                
                // Special Effects
                anisotropy: { type: 'number', description: 'Anisotropy level (range: 0-1)' },
                anisotropyRotation: { type: 'number', description: 'Anisotropy rotation (range: 0-6.28)' },
                iridescence: { type: 'number', description: 'Iridescence strength (range: 0-1)' },
                iridescenceIOR: { type: 'number', description: 'Iridescence IOR (range: 1-2.333)' },
                
                // Scene Properties
                backgroundColor: { type: 'string', description: 'Hexadecimal color for background' },
                fogEnabled: { type: 'boolean', description: 'Enable fog effect' },
                fogColor: { type: 'string', description: 'Hexadecimal color for fog' },
                fogDensity: { type: 'number', description: 'Fog density (range: 0-1)' },
                
                // Camera Properties
                // cameraDistance: { type: 'number', description: 'Camera distance (range: 0-20)' },
                // cameraHeight: { type: 'number', description: 'Camera height (range: -20-20)' },
                // rotationSpeed: { type: 'number', description: 'Auto-rotation speed (range: 0-2)' }
            }
        }
    };

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a 3D graphics designer specializing in typography and materials. Your task is to create visually striking 3D text effects by manipulating various material and scene properties.

                        Current state:
                        ${Object.entries(currentState).map(([key, value]) => `${key}: ${value}`).join('\n')}

                        Creative Effect Guidelines:
                        1. Glass Effects:
                        - Use high transmission (0.8-1.0)
                        - Set appropriate IOR (1.5 for glass)
                        - Lower roughness (0-0.2)
                        - Enable transparency

                        2. Metallic Effects:
                        - High metalness (0.8-1.0)
                        - Adjust roughness for shine
                        - Use appropriate colors
                        - Consider anisotropy for brushed metal

                        3. Pearlescent/Iridescent Effects:
                        - Enable clearcoat (0.8-1.0)
                        - Add iridescence (0.5-1.0)
                        - Subtle sheenColor
                        - Low roughness

                        4. Glowing Effects:
                        - Use emissive colors
                        - High emissiveIntensity
                        - Consider fog for atmosphere

                        5. Environmental Enhancement:
                        - Use fog for depth
                        - Coordinate backgroundColor
                        - Adjust camera for best view
                        - Consider auto-rotation for showcase

                        When responding to prompts:
                        - Keep the current text unless specifically asked to change it
                        - Maintain parameter ranges within specified limits
                        - Consider combining effects for unique looks
                        - DO NOT Update camera position for best viewing angle
                        - Coordinate colors between materials, emission, and background

                        Special Instructions:
                        - For glass, always enable transparency
                        - For metals, keep transmission at 0
                        - For glowing effects, coordinate emissive and background colors
                        - For pearlescent, combine clearcoat with subtle iridescence
                    
                    If the user doesn't specify text content, keep the current text.
                    Always ensure parameters stay within their specified ranges.
                    You do not have to change all parameters when prompted.`,
                },
                { role: 'user', content: prompt },
            ],
            functions: [functionSchema],
            function_call: { name: 'createText' },
        });

        const response = completion.choices[0]?.message?.function_call;

        if (!response || !response.arguments) {
            return res.status(400).json({
                error: 'Invalid response from AI model.',
                response: currentState,
            });
        }

        const newState = JSON.parse(response.arguments);
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