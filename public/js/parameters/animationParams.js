export const animationParams = {
    // Rotation speeds (in radians per frame)
    rotateX: 0,        // X-axis rotation speed
    rotateY: 0,        // Y-axis rotation speed
    rotateZ: 0,        // Z-axis rotation speed
    
    // Individual toggle states
    rotateXEnabled: false,
    rotateYEnabled: false,
    rotateZEnabled: false,

    // Scale/Pulse animation parameters
    scaleEnabled: false,   // Toggle for scale animation
    scaleSpeed: 0.02,     // Speed of scale oscillation
    scaleMin: 0.8,        // Minimum scale factor
    scaleMax: 1.2,        // Maximum scale factor
    currentScale: 1,      // Current scale value (internal tracking)
    scaleDirection: 1     // 1 for increasing, -1 for decreasing
};