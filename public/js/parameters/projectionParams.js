export const projectionParams = {
    enabled: false,
    projectionType: 'standard', // 'standard' or 'pattern'
    mode: 'torusknot',     // Options: 'torusknot', 'cube', 'sphere', 'donut', 'cylinder', 'cone', 'octahedron'
    scale: 1.0,
    repeat: 10,
    // Geometry segment parameters
    segments: {
        torusknot: { tubes: 16, turns: 100 },
        sphere: { width: 32, height: 32 },
        cube: { segments: 1 },
        donut: { radius: 10, tube: 3, radialSegments: 16, tubularSegments: 100 },
        cylinder: { radiusTop: 5, radiusBottom: 5, height: 20, segments: 32 },
        cone: { radius: 5, height: 20, segments: 32 },
        octahedron: { radius: 10 }
    },
    // Rotation parameters
    rotation: {
        x: 0,
        y: 0,
        z: 0
    },
    // Pattern-specific parameters
    pattern: {
        enabled: false,
        // Animation
        animatePattern: true,
        animationDirection: 'vertical', // 'vertical', 'horizontal', 'diagonal'
        animationSpeed: 0.009,
        animationReverse: false,
        // Pattern
        repeatX: 4,
        repeatY: 4,
        letterSpacing: 0.5,
        wordSpacing: 1.0,
        // Colors
        backgroundColor: '#000000',
        textColor: '#ffffff',
        opacity: 1.0
    }
};