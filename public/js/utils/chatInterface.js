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
            completion: "A cascading wall of text resembling digital rainfall, creating an immersive, hypnotic effect. The letters blur as they descend, mimicking the aesthetic of heavy rain in a cybernetic world.  ",
            // Hidden context that will be added to the prompt
            aiContext: `
            *Scene Settings:*  
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
            completion: "Text morphing into fluid, organic forms, appearing as if it is melting or stretching in a surreal liquid-like motion. It flows dynamically, reacting to movement as if suspended in an unseen gravitational field. ",
            aiContext: 
            `
            *Scene Settings:*  
Projection Type: Pattern  
Mode: Torus Knot  
Horizontal Repeat: 19.00  
Vertical Repeat: 9.00  
Letter Spacing: Custom  
Word Spacing: 0.50  
Animation Direction: Diagonal  
Reverse Direction: Disabled  
Animation Speed: 0.00  
Background Color: Deep Red (RGB: 75, 7, 7)  
Text Color: Intense Red (RGB: 255, 0, 0)  
Object Color: Matching Red (RGB: 255, 0, 0)  
Opacity: 0.70  
            `
        },
        {
            prefix: "Prompt 3",
            completion: "Glowing letters scattered over a fiery red background, crackling with neon-like energy. Chaotic, flickering, and full of motion—like electric sparks or a digital punk aesthetic. ",
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
            `
        }
    ];

    // Create container with horizontal scroll
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
        
        // Add click handler with hidden context
        bubble.addEventListener('click', () => {
            const promptInput = document.getElementById('promptInput');
            if (promptInput) {
                // Set the visible text in the input
                promptInput.value = `${suggestion.prefix} ${suggestion.completion}`;
                // Store the hidden context as a data attribute on the input
                promptInput.dataset.aiContext = suggestion.aiContext;
                promptInput.focus();
            }
        });
        
        suggestionsContainer.appendChild(bubble);
    });

    scrollContainer.appendChild(suggestionsContainer);

    // Insert before the chat input area
    const chatInput = document.querySelector('.chat-input');
    chatInput.parentNode.insertBefore(scrollContainer, chatInput);

    // Modify your send button handler to include the hidden context
    const sendButton = document.getElementById('send');
    const originalClickHandler = sendButton.onclick;
    sendButton.onclick = async (e) => {
        const promptInput = document.getElementById('promptInput');
        const aiContext = promptInput.dataset.aiContext || '';
        
        // If there's hidden context, prepend it to the actual prompt
        if (aiContext) {
            const visiblePrompt = promptInput.value;
            promptInput.value = `${aiContext}\n\nUser's request: ${visiblePrompt}`;
        }
        
        // Call the original handler
        if (originalClickHandler) {
            originalClickHandler.call(sendButton, e);
        }
        
        // Clear the hidden context after sending
        delete promptInput.dataset.aiContext;
    };
}