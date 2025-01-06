import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { createText, updateMaterial, updateSceneBackground } from './three.setup.js';
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
        
        // Update static typography parameters
        Object.assign(textParams, {
            text: result.response.text || textParams.text,
            font: result.response.font || textParams.font,
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
    updateStaticTypography();
    updateRotationControls();
    updateScaleControls();
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