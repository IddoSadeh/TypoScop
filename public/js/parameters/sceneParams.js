// parameters/sceneParams.js
export const sceneParams = {
    // Background settings
    backgroundColor: '#000000',
    backgroundOpacity: 1.0,
    
    // Fog settings
    fogEnabled: false,
    fogColor: '#000000',
    fogDensity: 0.1,
    
    // Lighting settings
    ambientLightIntensity: 0.5,
    mainLightIntensity: 0.8,
    fillLightIntensity: 0.5,
    
    // Camera settings
    cameraDistance: 30,
    fieldOfView: 45,
    
    // Store the original state of the scene (for projection feature)
    originalState: null  // Will be populated when needed
};