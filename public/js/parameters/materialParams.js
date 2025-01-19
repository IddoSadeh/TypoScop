// Material parameters
export const materialParams = {
    // Basic material properties
    color: '#ffffff',
    metalness: 0,
    roughness: 0.5,

    // Shared color pattern properties
    colorHueStart: 0,      // 0-1 range
    colorHueRange: 0.2,    // 0-1 range
    colorSatStart: 0.5,    // 0-1 range
    colorSatRange: 0.5,    // 0-1 range
    colorLightStart: 0.5,  // 0-1 range
    colorLightRange: 0.3,  // 0-1 range
    colorPattern: 'random', // 'random', 'gradient', 'waves'

    // Material-specific properties
    tessellationEnabled: false,
    tessellationSegments: 8,
    tessellationAnimationEnabled: false,
    tessellationAnimationSpeed: 0.5,
    tessellationAnimationIntensity: 1.0,

    wireframeEnabled: false,
    wireframeOpacity: 0.3,
    wireframeAnimationEnabled: false,
    wireframeAnimationSpeed: 0.5,
    wireframeAnimationAmplitude: 5.0
};