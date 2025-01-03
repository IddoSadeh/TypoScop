import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { createText, updateMaterial, updateSceneBackground } from './three.setup.js';

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
        updateChatHistory('ai', 'Updated text appearance!');
        
        // Update parameters
        Object.assign(textParams, {
            text: result.response.text || textParams.text,
            font: result.response.font || textParams.font
        });

        Object.assign(materialParams, {
            color: result.response.color || materialParams.color,
            metalness: result.response.metalness ?? materialParams.metalness,
            roughness: result.response.roughness ?? materialParams.roughness
        });

        Object.assign(sceneParams, {
            backgroundColor: result.response.backgroundColor || sceneParams.backgroundColor
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

    // Update color pickers
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
        colorPicker.value = materialParams.color;
    }

    const backgroundPicker = document.getElementById('background-color');
    if (backgroundPicker) {
        backgroundPicker.value = sceneParams.backgroundColor;
    }

    // Update sliders
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
}