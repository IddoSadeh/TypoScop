import { textParams } from '../parameters/textParams.js';
import { createText } from '../utils/three.setup.js';

export function setupTextControls() {
    const textInput = document.getElementById('ai-text-input');
    const fontSelect = document.getElementById('ai-font-name');

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
}