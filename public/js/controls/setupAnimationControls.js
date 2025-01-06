// public/js/controls/setupAnimationControls.js

import { animationParams } from '../parameters/animationParams.js';

export function setupAnimationControls() {
    // Setup controls for each axis
    setupAxisControls('x');
    setupAxisControls('y');
    setupAxisControls('z');
}

function setupAxisControls(axis) {
    const toggle = document.getElementById(`rotate-${axis}-toggle`);
    const slider = document.getElementById(`rotate-${axis}`);
    const valueDisplay = document.getElementById(`rotate-${axis}-value`);
    
    // Toggle handler
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            animationParams[`rotate${axis.toUpperCase()}Enabled`] = e.target.checked;
        });
    }
    
    // Slider handler
    if (slider) {
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            animationParams[`rotate${axis.toUpperCase()}`] = value;
            if (valueDisplay) {
                valueDisplay.textContent = value.toFixed(3);
            }
        });
    }
}