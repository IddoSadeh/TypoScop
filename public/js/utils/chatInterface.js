import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { createText, updateMaterial, updateSceneBackground, updateMultiTextCopies } from './three.setup.js';
import { animationParams } from '../parameters/animationParams.js';

export function setupChatInterface() {
    const sendButton = document.getElementById('send');
    const promptInput = document.getElementById('promptInput');

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

// Update this section in handleAPIResponse() function in chatInterface.js

    // Update manipulation parameters
    Object.assign(materialParams, {
        // Tessellation parameters
        tessellationEnabled: result.response.tessellationEnabled ?? materialParams.tessellationEnabled,
        tessellationSegments: result.response.tessellationSegments ?? materialParams.tessellationSegments,

        // Wireframe parameters
        wireframeEnabled: result.response.wireframeEnabled ?? materialParams.wireframeEnabled,
        wireframeOpacity: result.response.wireframeOpacity ?? materialParams.wireframeOpacity,

        // Shared color pattern properties
        colorHueStart: result.response.colorHueStart ?? materialParams.colorHueStart,
        colorHueRange: result.response.colorHueRange ?? materialParams.colorHueRange,
        colorSatStart: result.response.colorSatStart ?? materialParams.colorSatStart,
        colorSatRange: result.response.colorSatRange ?? materialParams.colorSatRange,
        colorLightStart: result.response.colorLightStart ?? materialParams.colorLightStart,
        colorLightRange: result.response.colorLightRange ?? materialParams.colorLightRange,
        colorPattern: result.response.colorPattern || materialParams.colorPattern,

        // Unified manipulation animation parameters
        manipulationAnimationEnabled: result.response.manipulationAnimationEnabled ?? materialParams.manipulationAnimationEnabled,
        manipulationAnimationSpeed: result.response.manipulationAnimationSpeed ?? materialParams.manipulationAnimationSpeed,
        manipulationAnimationIntensity: result.response.manipulationAnimationIntensity ?? materialParams.manipulationAnimationIntensity
    });
        // Update static typography parameters
        Object.assign(textParams, {
            height: result.response.height ?? textParams.height
        });

        Object.assign(materialParams, {
            color: result.response.color || materialParams.color,
            metalness: result.response.metalness ?? materialParams.metalness,
            roughness: result.response.roughness ?? materialParams.roughness
        });

        Object.assign(sceneParams, {
            backgroundColor: result.response.backgroundColor || sceneParams.backgroundColor
        });

        // Update rotation parameters
        Object.assign(animationParams, {
            rotateX: result.response.rotateX ?? animationParams.rotateX,
            rotateY: result.response.rotateY ?? animationParams.rotateY,
            rotateZ: result.response.rotateZ ?? animationParams.rotateZ,
            rotateXEnabled: result.response.rotateXEnabled ?? animationParams.rotateXEnabled,
            rotateYEnabled: result.response.rotateYEnabled ?? animationParams.rotateYEnabled,
            rotateZEnabled: result.response.rotateZEnabled ?? animationParams.rotateZEnabled
        });

        // Update scale parameters
        Object.assign(animationParams, {
            scaleEnabled: result.response.scaleEnabled ?? animationParams.scaleEnabled,
            scaleSpeed: result.response.scaleSpeed ?? animationParams.scaleSpeed,
            scaleMin: result.response.scaleMin ?? animationParams.scaleMin,
            scaleMax: result.response.scaleMax ?? animationParams.scaleMax
        });

        // Update scramble parameters
        Object.assign(animationParams, {
            scrambleEnabled: result.response.scrambleEnabled ?? animationParams.scrambleEnabled,
            scrambleSpeed: result.response.scrambleSpeed ?? animationParams.scrambleSpeed,
            scrambleIntensity: result.response.scrambleIntensity ?? animationParams.scrambleIntensity,
            scrambleMode: result.response.scrambleMode || animationParams.scrambleMode
        });

        // Update multi-text parameters
        Object.assign(animationParams, {
            multiTextEnabled: result.response.multiTextEnabled ?? animationParams.multiTextEnabled,
            copyCount: result.response.copyCount ?? animationParams.copyCount,
            spread: result.response.spread ?? animationParams.spread,
            rotateIndependently: result.response.rotateIndependently ?? animationParams.rotateIndependently
        });

        // Update UI
        updateUIControls();

        // Update 3D scene
        updateSceneBackground();
        createText();
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
        if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
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