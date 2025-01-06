import { animationParams } from '../parameters/animationParams.js';

export function setupAnimationControls() {
    // Setup rotation controls for each axis
    setupAxisControls('x');
    setupAxisControls('y');
    setupAxisControls('z');
    
    // Setup scale/pulse controls
    setupScaleControls();
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