// Material parameters
export const materialParams = {
    // Basic material properties
    color: '#ffffff',
    metalness: 0,
    roughness: 0.5,

    // Material type toggles
    tessellationEnabled: false,
    wireframeEnabled: false,
    particlesEnabled: false,

    // Tessellation parameters
    tessellationSegments: 8,
    tessellationHueStart: 0,
    tessellationHueRange: 0.2,
    tessellationSatStart: 0.5,
    tessellationSatRange: 0.5,
    tessellationLightStart: 0.5,
    tessellationLightRange: 0.3,
    tessellationPattern: 'random',

    // Wireframe parameters
    wireframeOpacity: 0.8,

    // Particle parameters
    particleSize: 0.05,
    particleDensity: 1.0,    // Controls how many particles to generate
    particleRandomness: 0.1, // Random offset from original position
    particleShape: 'sphere', // 'sphere', 'cube', 'torus'
    particleScale: 1.0,
    
    // Animation parameters
    manipulationAnimationEnabled: false,
    manipulationAnimationSpeed: 0.5,
    manipulationAnimationIntensity: 1.0
};