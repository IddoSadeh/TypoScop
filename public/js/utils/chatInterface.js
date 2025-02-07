// chatInterface.js
import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';
import { projectionParams } from '../parameters/projectionParams.js';
import { createText, updateSceneBackground } from './three.setup.js';
import { updateMultiTextCopies } from './animationManager.js';
import { updateProjectionControls } from '../controls/setupProjectionControls.js';
import fontManager from './fontManager.js';

export function setupChatInterface() {
    const sendButton = document.getElementById('send');
    const promptInput = document.getElementById('promptInput');
    createSuggestionBubbles();

    if (sendButton && promptInput) {
        sendButton.addEventListener('click', async () => {
            const prompt = promptInput.value.trim();
            if (!prompt) return;

            updateChatHistory('user', prompt);
            
            try {
                const response = await fetch('/api/customize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                handleAPIResponse(result);
                promptInput.value = '';
            } catch (error) {
                console.error('API Error:', error);
                updateChatHistory('ai', 'Error: Could not connect to the server.');
            }
        });
    }
}

function updateChatHistory(role, content) {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.className = role === 'user' ? 'user-message' : 'ai-message';
    message.textContent = `${role === 'user' ? 'You' : 'AI'}: ${content}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleAPIResponse(result) {
    if (result.response) {
        let message = result.changes?.length > 0 ? 
        'Parameters being updated:\n' + result.changes.join('\n') :
        'No parameters were changed.';
        
        updateChatHistory('ai', message);

        // Update material parameters
        Object.assign(materialParams, {
            // Previous material parameters remain the same
            tessellationEnabled: result.response.tessellationEnabled ?? materialParams.tessellationEnabled,
            tessellationSegments: result.response.tessellationSegments ?? materialParams.tessellationSegments,
            wireframeEnabled: result.response.wireframeEnabled ?? materialParams.wireframeEnabled,
            wireframeOpacity: result.response.wireframeOpacity ?? materialParams.wireframeOpacity,
            colorHueStart: result.response.colorHueStart ?? materialParams.colorHueStart,
            colorHueRange: result.response.colorHueRange ?? materialParams.colorHueRange,
            colorSatStart: result.response.colorSatStart ?? materialParams.colorSatStart,
            colorSatRange: result.response.colorSatRange ?? materialParams.colorSatRange,
            colorLightStart: result.response.colorLightStart ?? materialParams.colorLightStart,
            colorLightRange: result.response.colorLightRange ?? materialParams.colorLightRange,
            colorPattern: result.response.colorPattern || materialParams.colorPattern,
            color: result.response.color || materialParams.color,
            metalness: result.response.metalness ?? materialParams.metalness,
            roughness: result.response.roughness ?? materialParams.roughness,
            manipulationAnimationEnabled: result.response.manipulationAnimationEnabled ?? materialParams.manipulationAnimationEnabled,
            manipulationAnimationSpeed: result.response.manipulationAnimationSpeed ?? materialParams.manipulationAnimationSpeed,
            manipulationAnimationIntensity: result.response.manipulationAnimationIntensity ?? materialParams.manipulationAnimationIntensity,
            particlesEnabled: result.response.particlesEnabled ?? materialParams.particlesEnabled,
            particleShape: result.response.particleShape || materialParams.particleShape,
            particleSize: result.response.particleSize ?? materialParams.particleSize,
            particleDensity: result.response.particleDensity ?? materialParams.particleDensity,
            particleRandomness: result.response.particleRandomness ?? materialParams.particleRandomness,
            particleScale: result.response.particleScale ?? materialParams.particleScale
        });

        // Update text parameters
        Object.assign(textParams, {
            height: result.response.height ?? textParams.height,
            size: result.response.textSize ?? textParams.size,
            letterSpacing: result.response.letterSpacing ?? textParams.letterSpacing,
            curveSegments: result.response.curveSegments ?? textParams.curveSegments,
            bevelEnabled: result.response.bevelEnabled ?? textParams.bevelEnabled,
            bevelThickness: result.response.bevelThickness ?? textParams.bevelThickness,
            bevelSize: result.response.bevelSize ?? textParams.bevelSize,
            bevelSegments: result.response.bevelSegments ?? textParams.bevelSegments
        });

        // Handle font changes
        if (result.response.font) {
            const { font } = fontManager.processText(textParams.text, result.response.font);
            textParams.font = font;
        }

        // Update scene parameters
        Object.assign(sceneParams, {
            backgroundColor: result.response.backgroundColor || sceneParams.backgroundColor,
            backgroundOpacity: result.response.backgroundOpacity ?? sceneParams.backgroundOpacity,
            fogEnabled: result.response.fogEnabled ?? sceneParams.fogEnabled,
            fogColor: result.response.fogColor || sceneParams.fogColor,
            fogDensity: result.response.fogDensity ?? sceneParams.fogDensity,
            ambientLightIntensity: result.response.ambientLightIntensity ?? sceneParams.ambientLightIntensity,
            mainLightIntensity: result.response.mainLightIntensity ?? sceneParams.mainLightIntensity,
            fillLightIntensity: result.response.fillLightIntensity ?? sceneParams.fillLightIntensity,
            cameraDistance: result.response.cameraDistance ?? sceneParams.cameraDistance,
            fieldOfView: result.response.fieldOfView ?? sceneParams.fieldOfView,
            position: {
                x: result.response.scenePositionX ?? sceneParams.position.x,
                y: result.response.scenePositionY ?? sceneParams.position.y,
                z: sceneParams.position.z
            }
        });

        // Update animation parameters
        Object.assign(animationParams, {
            // Previous animation parameters remain the same
            rotateX: result.response.rotateX ?? animationParams.rotateX,
            rotateY: result.response.rotateY ?? animationParams.rotateY,
            rotateZ: result.response.rotateZ ?? animationParams.rotateZ,
            rotateXEnabled: result.response.rotateXEnabled ?? animationParams.rotateXEnabled,
            rotateYEnabled: result.response.rotateYEnabled ?? animationParams.rotateYEnabled,
            rotateZEnabled: result.response.rotateZEnabled ?? animationParams.rotateZEnabled,
            scaleEnabled: result.response.scaleEnabled ?? animationParams.scaleEnabled,
            scaleSpeed: result.response.scaleSpeed ?? animationParams.scaleSpeed,
            scaleMin: result.response.scaleMin ?? animationParams.scaleMin,
            scaleMax: result.response.scaleMax ?? animationParams.scaleMax,
            scrambleEnabled: result.response.scrambleEnabled ?? animationParams.scrambleEnabled,
            scrambleSpeed: result.response.scrambleSpeed ?? animationParams.scrambleSpeed,
            scrambleIntensity: result.response.scrambleIntensity ?? animationParams.scrambleIntensity,
            scrambleMode: result.response.scrambleMode || animationParams.scrambleMode,
            multiTextEnabled: result.response.multiTextEnabled ?? animationParams.multiTextEnabled,
            copyCount: result.response.copyCount ?? animationParams.copyCount,
            spread: result.response.spread ?? animationParams.spread,
            rotateIndependently: result.response.rotateIndependently ?? animationParams.rotateIndependently,
            // Add projection parameters
            projectionEnabled: result.response.projectionEnabled ?? animationParams.projectionEnabled,
            projectionMode: result.response.projectionMode || animationParams.projectionMode,
            projectionScale: result.response.projectionScale ?? animationParams.projectionScale,
            projectionRepeat: result.response.projectionRepeat ?? animationParams.projectionRepeat
        });

        
        Object.assign(projectionParams, {
            enabled: result.response.projectionEnabled ?? projectionParams.enabled,
            projectionType: result.response.projectionType || projectionParams.projectionType,
            mode: result.response.projectionMode || projectionParams.mode,
            scale: result.response.projectionScale ?? projectionParams.scale,
            repeat: result.response.projectionRepeat ?? projectionParams.repeat,
            // Pattern parameters
            pattern: {
                ...projectionParams.pattern,
                enabled: result.response.patternEnabled ?? projectionParams.pattern.enabled,
                animatePattern: result.response.patternAnimatePattern ?? projectionParams.pattern.animatePattern,
                animationDirection: result.response.patternAnimationDirection || projectionParams.pattern.animationDirection,
                animationSpeed: result.response.patternAnimationSpeed ?? projectionParams.pattern.animationSpeed,
                animationReverse: result.response.patternAnimationReverse ?? projectionParams.pattern.animationReverse,
                repeatX: result.response.patternRepeatX ?? projectionParams.pattern.repeatX,
                repeatY: result.response.patternRepeatY ?? projectionParams.pattern.repeatY,
                letterSpacing: result.response.patternLetterSpacing ?? projectionParams.pattern.letterSpacing,
                wordSpacing: result.response.patternWordSpacing ?? projectionParams.pattern.wordSpacing,
                backgroundColor: result.response.patternBackgroundColor || projectionParams.pattern.backgroundColor,
                textColor: result.response.patternTextColor || projectionParams.pattern.textColor,
                opacity: result.response.patternOpacity ?? projectionParams.pattern.opacity
            }
        });


        // Update UI
        updateUIControls();

        // Update 3D scene
        updateSceneBackground();
        createText(); // This will now use the font manager internally
    } else {
        updateChatHistory('ai', 'Error processing the request.');
    }
}

function updateUIControls() {
    updateManipulationControls();
    updateMultiTextControls();
    updateStaticTypography();
    updateRotationControls();
    updateScaleControls();
    updateScrambleControls();
    updateParticleControls();
    updateProjectionControls();
}

function updateStaticTypography() {
    // Update text input
    const textInput = document.getElementById('ai-text-input');
    if (textInput) {
        textInput.value = textParams.text;
    }

    // Update font select
    const fontSelect = document.getElementById('ai-font-name');
    if (fontSelect) {
        fontSelect.value = textParams.font;
    }

    // Update material controls
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
        colorPicker.value = materialParams.color;
    }

    const metalnessSlider = document.getElementById('metalness-slider');
    if (metalnessSlider) {
        metalnessSlider.value = materialParams.metalness;
        metalnessSlider.nextElementSibling.textContent = materialParams.metalness;
    }

    const roughnessSlider = document.getElementById('roughness-slider');
    if (roughnessSlider) {
        roughnessSlider.value = materialParams.roughness;
        roughnessSlider.nextElementSibling.textContent = materialParams.roughness;
    }

    // Update geometry controls
    const heightSlider = document.getElementById('text-height-slider');
    if (heightSlider) {
        heightSlider.value = textParams.height;
        heightSlider.nextElementSibling.textContent = textParams.height;
    }

    // Update scene controls
    const backgroundPicker = document.getElementById('background-color');
    if (backgroundPicker) {
        backgroundPicker.value = sceneParams.backgroundColor;
    }
}

function updateRotationControls() {
    updateAnimationControl('rotate-x', 'rotateX', 'rotate-x-toggle', 'rotateXEnabled');
    updateAnimationControl('rotate-y', 'rotateY', 'rotate-y-toggle', 'rotateYEnabled');
    updateAnimationControl('rotate-z', 'rotateZ', 'rotate-z-toggle', 'rotateZEnabled');
}

function updateAnimationControl(sliderId, speedParam, toggleId, enabledParam) {
    const slider = document.getElementById(sliderId);
    const toggle = document.getElementById(toggleId);
    const valueDisplay = document.getElementById(`${sliderId}-value`);

    if (slider) {
        slider.value = animationParams[speedParam];
        if (valueDisplay) {
            valueDisplay.textContent = animationParams[speedParam].toFixed(3);
        }
    }

    if (toggle) {
        toggle.checked = animationParams[enabledParam];
    }
}

function updateScaleControls() {
    const controls = {
        toggle: ['scale-toggle', 'scaleEnabled'],
        speed: ['scale-speed', 'scaleSpeed', 3],
        min: ['scale-min', 'scaleMin', 2],
        max: ['scale-max', 'scaleMax', 2]
    };

    for (const [type, [elementId, paramName, decimals]] of Object.entries(controls)) {
        const element = document.getElementById(elementId);
        if (!element) continue;

        if (type === 'toggle') {
            element.checked = animationParams[paramName];
        } else {
            element.value = animationParams[paramName];
            const valueDisplay = document.getElementById(`${elementId}-value`);
            if (valueDisplay) {
                valueDisplay.textContent = animationParams[paramName].toFixed(decimals);
            }
        }
    }
}

function updateScrambleControls() {
    const controls = {
        toggle: ['scramble-toggle', 'scrambleEnabled'],
        speed: ['scramble-speed', 'scrambleSpeed', 2],
        intensity: ['scramble-intensity', 'scrambleIntensity', 2]
    };

    // Update sliders and toggle
    for (const [type, [elementId, paramName, decimals]] of Object.entries(controls)) {
        const element = document.getElementById(elementId);
        if (!element) continue;

        if (type === 'toggle') {
            element.checked = animationParams[paramName];
        } else {
            element.value = animationParams[paramName];
            const valueDisplay = document.getElementById(`${elementId}-value`);
            if (valueDisplay) {
                valueDisplay.textContent = animationParams[paramName].toFixed(decimals);
            }
        }
    }

    // Update mode select
    const modeSelect = document.getElementById('scramble-mode');
    if (modeSelect) {
        modeSelect.value = animationParams.scrambleMode;
    }
}

function updateMultiTextControls() {
    const multiTextToggle = document.getElementById('multi-text-toggle');
    const copyCountSlider = document.getElementById('copy-count');
    const spreadSlider = document.getElementById('copy-spread');
    
    if (multiTextToggle) {
        multiTextToggle.checked = animationParams.multiTextEnabled;
    }
    
    if (copyCountSlider) {
        copyCountSlider.value = animationParams.copyCount;
        const valueDisplay = document.getElementById('copy-count-value');
        if (valueDisplay) {
            valueDisplay.textContent = animationParams.copyCount;
        }
    }
    
    if (spreadSlider) {
        spreadSlider.value = animationParams.spread;
        const valueDisplay = document.getElementById('copy-spread-value');
        if (valueDisplay) {
            valueDisplay.textContent = animationParams.spread;
        }
    }
    updateMultiTextCopies()
}

function updateManipulationControls() {
    // Update manipulation toggles
    const tessellationToggle = document.getElementById('tessellation-toggle');
    const wireframeToggle = document.getElementById('wireframe-toggle');
    const tessellationSegments = document.getElementById('tessellation-segments');
    
    if (tessellationToggle) {
        tessellationToggle.checked = materialParams.tessellationEnabled;
    }
    
    if (wireframeToggle) {
        wireframeToggle.checked = materialParams.wireframeEnabled;
    }

    // Show/hide tessellation segments based on state
    if (tessellationSegments) {
        tessellationSegments.style.display = materialParams.tessellationEnabled ? 'block' : 'none';
    }

    // Update manipulation animation controls
    const animationToggle = document.getElementById('manipulation-animation-toggle');
    const speedSlider = document.getElementById('manipulation-animation-speed');
    const intensitySlider = document.getElementById('manipulation-animation-intensity');
    const animationControls = document.getElementById('manipulation-animation-controls');

    if (animationControls) {
        if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
            animationControls.classList.add('enabled');

            if (animationToggle) {
                animationToggle.checked = materialParams.manipulationAnimationEnabled;
            }

            if (speedSlider) {
                speedSlider.value = materialParams.manipulationAnimationSpeed;
                const speedDisplay = document.getElementById('manipulation-animation-speed-value');
                if (speedDisplay) {
                    speedDisplay.textContent = materialParams.manipulationAnimationSpeed.toFixed(1);
                }
            }

            if (intensitySlider) {
                intensitySlider.value = materialParams.manipulationAnimationIntensity;
                const intensityDisplay = document.getElementById('manipulation-animation-intensity-value');
                if (intensityDisplay) {
                    intensityDisplay.textContent = materialParams.manipulationAnimationIntensity.toFixed(1);
                }
            }
        } else {
            animationControls.classList.remove('enabled');
        }
    }

    // Update color pattern controls
    const colorPatternSection = document.getElementById('color-pattern-section');
    if (colorPatternSection) {
        if (materialParams.tessellationEnabled || materialParams.wireframeEnabled || materialParams.particlesEnabled) {
            colorPatternSection.classList.add('enabled');
            // Update all color pattern controls
            const controls = {
                'color-hue-start': materialParams.colorHueStart,
                'color-hue-range': materialParams.colorHueRange,
                'color-sat-start': materialParams.colorSatStart,
                'color-sat-range': materialParams.colorSatRange,
                'color-light-start': materialParams.colorLightStart,
                'color-light-range': materialParams.colorLightRange
            };

            for (const [elementId, value] of Object.entries(controls)) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.value = value;
                    const valueDisplay = element.nextElementSibling;
                    if (valueDisplay) {
                        valueDisplay.textContent = value.toFixed(2);
                    }
                }
            }

            const patternSelect = document.getElementById('color-pattern');
            if (patternSelect) {
                patternSelect.value = materialParams.colorPattern;
            }
        } else {
            colorPatternSection.classList.remove('enabled');
        }
    }
}
function updateParticleControls() {
    // Particle toggle (enable/disable particles)
    const particleToggle = document.getElementById('particle-toggle');
    if (particleToggle) {
        particleToggle.checked = materialParams.particlesEnabled;
    }
  
    // Particle shape selection (e.g., a <select> element)
    const particleShapeSelect = document.getElementById('particle-shape');
    if (particleShapeSelect) {
        particleShapeSelect.value = materialParams.particleShape;
    }
  
    // Particle size slider
    const particleSizeSlider = document.getElementById('particle-size');
    if (particleSizeSlider) {
        particleSizeSlider.value = materialParams.particleSize;
        // Assuming you want to display the value in a sibling element:
        const display = particleSizeSlider.nextElementSibling;
        if (display) {
            display.textContent = materialParams.particleSize;
        }
    }
  
    // Particle density slider
    const particleDensitySlider = document.getElementById('particle-density');
    if (particleDensitySlider) {
        particleDensitySlider.value = materialParams.particleDensity;
        const display = particleDensitySlider.nextElementSibling;
        if (display) {
            display.textContent = materialParams.particleDensity;
        }
    }
  
    // Particle randomness slider
    const particleRandomnessSlider = document.getElementById('particle-randomness');
    if (particleRandomnessSlider) {
        particleRandomnessSlider.value = materialParams.particleRandomness;
        const display = particleRandomnessSlider.nextElementSibling;
        if (display) {
            display.textContent = materialParams.particleRandomness;
        }
    }
  
    // Particle scale slider
    const particleScaleSlider = document.getElementById('particle-scale');
    if (particleScaleSlider) {
        particleScaleSlider.value = materialParams.particleScale;
        const display = particleScaleSlider.nextElementSibling;
        if (display) {
            display.textContent = materialParams.particleScale;
        }
    }
}


function createSuggestionBubbles() {
    const suggestions = [
        {
            prefix: "Prompt 1",
            completion: "A cascading wall of text resembling digital rainfall, creating an immersive, hypnotic effect. The letters blur as they descend, mimicking the aesthetic of heavy rain in a cybernetic world.",
            aiContext: `
            *Scene Settings:* 
            Projection Enabled: True 
Projection Type: Pattern  
Mode: Torus Knot  
Horizontal Repeat: 19.00  
Vertical Repeat: 9.00  
Letter Spacing: Custom  
Word Spacing: 0.50  
Animation Direction: Diagonal  
Reverse Direction: Disabled  
Animation Speed: 0.00  
Background Color: Deep Blue (RGB: 5, 0, 92)  
Text Color: Light Cyan (RGB: 173, 216, 230)  
            `
        },
        {
            prefix: "Prompt 2",
            completion: "Text morphing into fluid, organic forms, appearing as if it is melting or stretching in a surreal liquid-like motion. It flows dynamically, reacting to movement as if suspended in an unseen gravitational field.",
            aiContext: `
            *Scene Settings:* 
             Projection Enabled: True  
Projection Type: Pattern  
Mode: Torus Knot  
Horizontal Repeat: 19.00  
Vertical Repeat: 9.00  
Letter Spacing: Custom  
Word Spacing: 0.50  
Animation Direction: Diagonal  
Reverse Direction: Disabled  
Animation Speed: 0.02  
Background Color: Deep Red (RGB: 75, 7, 7)  
Text Color: Intense Red (RGB: 255, 0, 0)  
Object Color: Matching Red (RGB: 255, 0, 0)  
Opacity: 0.70  
            `
        },
        {
            prefix: "Prompt 3",
            completion: "Glowing letters scattered over a fiery red background, crackling with neon-like energy. Chaotic, flickering, and full of motion—like electric sparks or a digital punk aesthetic.",
            aiContext: `
 *Material Settings:*  
Color: Bright Yellow (RGB: 255, 247, 5)  
Metalness: 0  
Roughness: 1  
Letter Spacing: 1.2  
Height: 0  

*Scene Settings:*  
Background Color: Intense Red (RGB: 255, 0, 0)  
Background Opacity: 1  

*Lighting Settings:*  
Ambient Light: 0.5  
Main Light: 0.4  
Fill Light: 1.0  

*Manipulation & Animation Settings:*  
Wireframe: Enabled  
Enable Animation: 
Animation Speed: 2.0  
Animation Intensity: 3.0  

*Letter Scramble:*  
Speed: 1.3  
Intensity: 3.0  
Mode: Random  

*Multiple Text Copies:*  
Number of Copies: 10  
Spread Distance: 60  
            `
        },{
        prefix: "Prompt 4",
        completion: "test",
        aiContext: `
{
  "textParams": {
    "text": "Hello World",
    "font": "helvetiker",
    "hebrewFont": "haim",
    "size": 5,
    "height": 0.1,
    "letterSpacing": 1.2,
    "curveSegments": 12,
    "bevelEnabled": true,
    "bevelThickness": 0.15,
    "bevelSize": 0.3,
    "bevelSegments": 5
  },
  "materialParams": {
    "color": "#FFF705",
    "metalness": 0,
    "roughness": 1,
    "tessellationEnabled": false,
    "wireframeEnabled": false,
    "particlesEnabled": false,
    "tessellationSegments": 8,
    "tessellationHueStart": 0,
    "tessellationHueRange": 0.2,
    "tessellationSatStart": 0.5,
    "tessellationSatRange": 0.5,
    "tessellationLightStart": 0.5,
    "tessellationLightRange": 0.3,
    "tessellationPattern": "random",
    "wireframeOpacity": 0.3,
    "particleSize": 1,
    "particleDensity": 1,
    "particleRandomness": 0.5,
    "particleShape": "sphere",
    "particleScale": 1,
    "manipulationAnimationEnabled": true,
    "manipulationAnimationSpeed": 2,
    "manipulationAnimationIntensity": 3,
    "colorHueStart": 0,
    "colorHueRange": 0.2,
    "colorSatStart": 0.5,
    "colorSatRange": 0.5,
    "colorLightStart": 0.5,
    "colorLightRange": 0.3,
    "colorPattern": "random"
  },
  "sceneParams": {
    "backgroundColor": "#FF0000",
    "backgroundOpacity": 1,
    "fogEnabled": false,
    "fogColor": "#000000",
    "fogDensity": 0.1,
    "ambientLightIntensity": 0.5,
    "mainLightIntensity": 0.4,
    "fillLightIntensity": 1,
    "cameraDistance": 30,
    "fieldOfView": 45,
    "position": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "originalState": null
  },
  "animationParams": {
    "rotateX": 0,
    "rotateY": 0,
    "rotateZ": 0,
    "rotateXEnabled": false,
    "rotateYEnabled": false,
    "rotateZEnabled": false,
    "scaleEnabled": false,
    "scaleSpeed": 0.02,
    "scaleMin": 0.8,
    "scaleMax": 1.2,
    "currentScale": 1,
    "scaleDirection": 1,
    "scrambleEnabled": false,
    "scrambleSpeed": 1.3,
    "scrambleIntensity": 3,
    "scrambleMode": "random",
    "letterPositions": [],
    "targetPositions": [],
    "scrambleProgress": 0,
    "lastScrambleTime": 0,
    "multiTextEnabled": false,
    "copyCount": 10,
    "spread": 60,
    "copies": [
      {
        "mesh": {
          "metadata": {
            "version": 4.5,
            "type": "Object",
            "generator": "Object3D.toJSON"
          },
          "geometries": [
            {
              "uuid": "2be1ab07-2d85-46c7-8a89-7405138a48cb",
              "type": "TorusKnotGeometry",
              "radius": 10,
              "tube": 3,
              "tubularSegments": 100,
              "radialSegments": 16,
              "p": 2,
              "q": 3
            }
          ],
          "materials": [
            {
              "uuid": "e7c2b8d1-6849-4ccb-83ef-a89b46f8cf73",
              "type": "MeshPhongMaterial",
              "color": 16777215,
              "emissive": 0,
              "specular": 1118481,
              "shininess": 30,
              "map": "d972cea2-887b-49ad-adb8-e81936254d2f",
              "reflectivity": 1,
              "refractionRatio": 0.98,
              "side": 2,
              "opacity": 0.7,
              "transparent": true,
              "depthFunc": 3,
              "depthTest": true,
              "depthWrite": true,
              "colorWrite": true,
              "stencilWrite": false,
              "stencilWriteMask": 255,
              "stencilFunc": 519,
              "stencilRef": 0,
              "stencilFuncMask": 255,
              "stencilFail": 7680,
              "stencilZFail": 7680,
              "stencilZPass": 7680
            }
          ],
          "textures": [
            {
              "uuid": "d972cea2-887b-49ad-adb8-e81936254d2f",
              "name": "",
              "image": "30f8832e-8d9a-4c47-85e2-580bc42de3ae",
              "mapping": 300,
              "channel": 0,
              "repeat": [
                19,
                9
              ],
              "offset": [
                -21.03999999999964,
                -21.03999999999964
              ],
              "center": [
                0,
                0
              ],
              "rotation": 0,
              "wrap": [
                1000,
                1000
              ],
              "format": 1023,
              "internalFormat": null,
              "type": 1009,
              "colorSpace": "",
              "minFilter": 1008,
              "magFilter": 1006,
              "anisotropy": 1,
              "flipY": true,
              "generateMipmaps": true,
              "premultiplyAlpha": false,
              "unpackAlignment": 4
            }
          ],
          "images": [
            {
              "uuid": "30f8832e-8d9a-4c47-85e2-580bc42de3ae",
              "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAXNSR0IArs4c6QAAIABJREFUeF7t3Qm0PEtdH/Ca9YoRWVzjgho1bhEVNeAS3GJcQFwABZFFBRQR2Rf1sYiiICCggIACgjw29y3uikYjiguJRiQaNZqICooKGLl3lrzf8L+P++bNTFdP9dz/v25/6hzOO4f/9EzVp+rOfLu6unpwm6OjZVIIECBAgACBXgkMBIBe9bfGEiBAgACBlYAAYCAQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeCggAPex0TSZAgAABAgKAMUCAAAECBHooIAD0sNM1mQABAgQICADGAAECBAgQ6KGAANDDTtdkAgQIECAgABgDBAgQIECghwICQA87XZMJECBAgIAAYAwQIECAAIEeClyIADBNKX3EYpE+aLlMPz0apTcfuCMHKaUPXC7TzReL9LvDYfrzQfw/CgECBAgQqEeg2gBww+Uy3WK5TLeaz9N/WCyuFb9qMkmvHg47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auw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBQSAQkCHEyBAgACBGgUEgBp7TZ0JECBAgEChgABQCOhwAgQIECBQo4AAUGOvqTMBAgQIECgUEAAKAR1OgAABAgRqFBAAauw1dSZAgAABAoUCAkAhoMMJECBAgECNAgJAjb2mzgQIECBAoFBAACgEdDgBAgQIEKhRQACosdfUmQABAgQIFAoIAIWADidAgAABAjUKCAA19po6EyBAgACBQgEBoBDQ4QQIECBAoEYBAaDGXlNnAgQIECBQKCAAFAI6nAABAgQI1CggANTYa+pMgAABAgQKBf4/VGtoUpqy2dEAAAAASUVORK5CYII="
            }
          ],
          "object": {
            "uuid": "3a19cc75-0e35-4981-848e-51f6fc965109",
            "type": "Mesh",
            "visible": false,
            "layers": 1,
            "matrix": [
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              -12.030925499197128,
              -18.106638437162022,
              0.29702777901763344,
              1
            ],
            "up": [
              0,
              1,
              0
            ],
            "geometry": "2be1ab07-2d85-46c7-8a89-7405138a48cb",
            "material": "e7c2b8d1-6849-4ccb-83ef-a89b46f8cf73"
          }
        },
        "basePosition": {
          "x": -12.030925499197128,
          "y": -18.106638437162022,
          "z": 0.29702777901763344
        },
        "rotationOffset": {
          "x": 0,
          "y": 0,
          "z": 0
        }
      }
    ],
    "projectionEnabled": true,
    "projectionMode": "torusknot",
    "projectionScale": 1,
    "projectionRepeat": 10
  },
  "projectionParams": {
    "enabled": true,
    "projectionType": "pattern",
    "mode": "torusknot",
    "scale": 1,
    "repeat": 10,
    "segments": {
      "torusknot": {
        "tubes": 16,
        "turns": 100
      },
      "sphere": {
        "width": 32,
        "height": 32
      },
      "cube": {
        "segments": 1
      },
      "donut": {
        "radius": 10,
        "tube": 3,
        "radialSegments": 16,
        "tubularSegments": 100
      },
      "cylinder": {
        "radiusTop": 5,
        "radiusBottom": 5,
        "height": 20,
        "segments": 32
      },
      "cone": {
        "radius": 5,
        "height": 20,
        "segments": 32
      },
      "octahedron": {
        "radius": 10
      }
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "pattern": {
      "enabled": false,
      "animatePattern": true,
      "animationDirection": "diagonal",
      "animationSpeed": 0.02,
      "animationReverse": false,
      "repeatX": 19,
      "repeatY": 9,
      "letterSpacing": 1,
      "wordSpacing": 1.7,
      "backgroundColor": "#4B0707",
      "textColor": "#FF0000",
      "opacity": 0.7
    }
  }
}
        `
    }


        
    ];

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'suggestions-scroll-container';

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-container';

    suggestions.forEach(suggestion => {
        const bubble = document.createElement('button');
        bubble.className = 'suggestion-bubble';
        
        const prefix = document.createElement('div');
        prefix.className = 'suggestion-prefix';
        prefix.textContent = suggestion.prefix;
        
        const completion = document.createElement('div');
        completion.className = 'suggestion-completion';
        completion.textContent = suggestion.completion;
        
        bubble.appendChild(prefix);
        bubble.appendChild(completion);
        
        // Add click handler to simulate chat interaction
        bubble.addEventListener('click', async () => {
            const promptInput = document.getElementById('promptInput');
            if (!promptInput) return;

            // Add user message to chat
            updateChatHistory('user', suggestion.completion);

            try {
                // Make API request with hidden context
                const response = await fetch('/api/customize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: `Start fresh with default settings and apply only these new changes:

${suggestion.aiContext}

To achieve this visual effect: ${suggestion.completion}

Previous settings or prompts should be completely ignored.` 
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                handleAPIResponse(result);
                
            } catch (error) {
                console.error('API Error:', error);
                updateChatHistory('ai', 'Error: Could not connect to the server.');
            }
        });
        
        suggestionsContainer.appendChild(bubble);
    });

    scrollContainer.appendChild(suggestionsContainer);

    // Insert before the chat input area
    const chatInput = document.querySelector('.chat-input');
    chatInput.parentNode.insertBefore(scrollContainer, chatInput);
}