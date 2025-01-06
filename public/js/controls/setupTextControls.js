import { textParams } from '../parameters/textParams.js';
import { createText } from '../utils/three.setup.js';

export function setupTextControls() {
    const textInput = document.getElementById('ai-text-input');
    const fontSelect = document.getElementById('ai-font-name');
    const heightSlider = document.getElementById('text-height-slider');

    // Text input
    textInput?.addEventListener('input', (e) => {
        textParams.text = e.target.value;
        createText();
    });

    // Font selection
    fontSelect?.addEventListener('change', (e) => {
        textParams.font = e.target.value;
        createText();
    });

    // Height
    heightSlider?.addEventListener('input', (e) => {
        textParams.height = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = textParams.height;
        createText();
    });
    
}