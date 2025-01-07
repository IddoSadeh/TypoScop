import { animationParams } from '../parameters/animationParams.js';
import { createText } from '../utils/three.setup.js';

export function setupAnimationControls() {
    // Setup rotation controls for each axis
    setupAxisControls('x');
    setupAxisControls('y');
    setupAxisControls('z');
    
    // Setup scale/pulse controls
    setupScaleControls();

    // Setup scramble controls
    setupScrambleControls();
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

function setupScaleControls() {
    const scaleToggle = document.getElementById('scale-toggle');
    const scaleSpeedSlider = document.getElementById('scale-speed');
    const scaleMinSlider = document.getElementById('scale-min');
    const scaleMaxSlider = document.getElementById('scale-max');
    
    // Scale animation toggle
    if (scaleToggle) {
        scaleToggle.addEventListener('change', (e) => {
            animationParams.scaleEnabled = e.target.checked;
            // Reset scale when disabled
            if (!e.target.checked) {
                animationParams.currentScale = 1;
                animationParams.scaleDirection = 1;
            }
        });
    }
    
    // Scale speed control
    if (scaleSpeedSlider) {
        scaleSpeedSlider.addEventListener('input', (e) => {
            animationParams.scaleSpeed = parseFloat(e.target.value);
            const valueDisplay = document.getElementById('scale-speed-value');
            if (valueDisplay) {
                valueDisplay.textContent = animationParams.scaleSpeed.toFixed(3);
            }
        });
    }
    
    // Min scale control
    if (scaleMinSlider) {
        scaleMinSlider.addEventListener('input', (e) => {
            animationParams.scaleMin = parseFloat(e.target.value);
            const valueDisplay = document.getElementById('scale-min-value');
            if (valueDisplay) {
                valueDisplay.textContent = animationParams.scaleMin.toFixed(2);
            }
        });
    }
    
    // Max scale control
    if (scaleMaxSlider) {
        scaleMaxSlider.addEventListener('input', (e) => {
            animationParams.scaleMax = parseFloat(e.target.value);
            const valueDisplay = document.getElementById('scale-max-value');
            if (valueDisplay) {
                valueDisplay.textContent = animationParams.scaleMax.toFixed(2);
            }
        });
    }
}

function setupScrambleControls() {
    const scrambleToggle = document.getElementById('scramble-toggle');
    const scrambleSpeedSlider = document.getElementById('scramble-speed');
    const scrambleIntensitySlider = document.getElementById('scramble-intensity');
    const scrambleModeSelect = document.getElementById('scramble-mode');
    
    // Scramble toggle
    if (scrambleToggle) {
        scrambleToggle.addEventListener('change', (e) => {
            animationParams.scrambleEnabled = e.target.checked;
            if (e.target.checked) {
                // Reinitialize text with individual letters when enabling
                createText();
            } else {
                // Reset positions when disabled
                createText();
            }
        });
    }
    
    // Speed control
    if (scrambleSpeedSlider) {
        scrambleSpeedSlider.addEventListener('input', (e) => {
            animationParams.scrambleSpeed = parseFloat(e.target.value);
            const valueDisplay = document.getElementById('scramble-speed-value');
            if (valueDisplay) {
                valueDisplay.textContent = animationParams.scrambleSpeed.toFixed(2);
            }
        });
    }
    
    // Intensity control
    if (scrambleIntensitySlider) {
        scrambleIntensitySlider.addEventListener('input', (e) => {
            animationParams.scrambleIntensity = parseFloat(e.target.value);
            const valueDisplay = document.getElementById('scramble-intensity-value');
            if (valueDisplay) {
                valueDisplay.textContent = animationParams.scrambleIntensity.toFixed(2);
            }
        });
    }
    
    // Mode selection
    if (scrambleModeSelect) {
        scrambleModeSelect.addEventListener('change', (e) => {
            animationParams.scrambleMode = e.target.value;
            // Reset current animation when changing modes
            animationParams.scrambleProgress = 1; // Force new positions calculation
        });
    }
}