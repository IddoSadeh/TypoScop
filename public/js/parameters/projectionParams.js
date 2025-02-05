// parameters/projectionParams.js
export const projectionParams = {
    enabled: false,
    mode: 'torusknot',     // Options: 'torusknot', 'cube', 'sphere', 'twisted'
    scale: 1.0,
    repeat: 10,
    // Geometry segment parameters
    segments: {
        torusknot: { tubes: 16, turns: 100 },
        sphere: { width: 32, height: 32 },
        cube: { segments: 1 },
        twisted: { tubes: 20, turns: 150 }
    },
    // Rotation parameters
    rotation: {
        x: 0,
        y: 0,
        z: 0
    }
};