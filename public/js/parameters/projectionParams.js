export const projectionParams = {
    enabled: false,
    projectionType: 'standard', // 'standard' or 'pattern'
    mode: 'torusknot',     // Options: 'torusknot', 'cube', 'sphere', 'twisted'
    scale: 1.0,
    repeat: 10,
    // Geometry segment parameters
    segments: {
        torusknot: { tubes: 16, turns: 100 },
        sphere: { width: 32, height: 32 },
        cube: { segments: 1 },
        twisted: { tubes: 20, turns: 150 },
        pattern: { 
            width: 4,      // Pattern repeat width
            height: 4,     // Pattern repeat height
            speed: 0.009,  // Animation speed
            segments: 32   // Geometry detail
        }
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
        objectColor: '#ffffff',
        opacity: 1.0
    }
};