// controls/setupProjectionControls.js
import { projectionParams } from '../parameters/projectionParams.js';
import { createText } from '../utils/three.setup.js';

export function setupProjectionControls() {
    // Original projection controls
    const projectionToggle = document.getElementById('projection-toggle');
    const projectionType = document.getElementById('projection-type');
    const projectionMode = document.getElementById('projection-mode');

    // Basic projection controls
    if (projectionToggle) {
        projectionToggle.addEventListener('change', (e) => {
            projectionParams.enabled = e.target.checked;
            createText();
        });
    }

    if (projectionType) {
        projectionType.addEventListener('change', (e) => {
            projectionParams.projectionType = e.target.value;
            if (projectionParams.enabled) {
                createText();
            }
        });
    }

    if (projectionMode) {
        projectionMode.addEventListener('change', (e) => {
            projectionParams.mode = e.target.value;
            if (projectionParams.enabled) {
                createText();
            }
        });
    }

    // Pattern controls
    const setupRangeControl = (id, paramPath, multiplier = 1) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) * multiplier;
                const path = paramPath.split('.');
                let target = projectionParams;
                for (let i = 0; i < path.length - 1; i++) {
                    target = target[path[i]];
                }
                target[path[path.length - 1]] = value;
                
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay) {
                    valueDisplay.textContent = value.toFixed(2);
                }
                
                if (projectionParams.enabled && projectionParams.projectionType === 'pattern') {
                    createText();
                }
            });
        }
    };

    const setupColorControl = (id, paramPath) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', (e) => {
                const path = paramPath.split('.');
                let target = projectionParams;
                for (let i = 0; i < path.length - 1; i++) {
                    target = target[path[i]];
                }
                target[path[path.length - 1]] = e.target.value;
                
                if (projectionParams.enabled && projectionParams.projectionType === 'pattern') {
                    createText();
                }
            });
        }
    };

    const setupToggleControl = (id, paramPath) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', (e) => {
                const path = paramPath.split('.');
                let target = projectionParams;
                for (let i = 0; i < path.length - 1; i++) {
                    target = target[path[i]];
                }
                target[path[path.length - 1]] = e.target.checked;
                
                if (projectionParams.enabled && projectionParams.projectionType === 'pattern') {
                    createText();
                }
            });
        }
    };

    // Setup pattern controls
    setupRangeControl('pattern-repeat-x', 'pattern.repeatX');
    setupRangeControl('pattern-repeat-y', 'pattern.repeatY');
    setupRangeControl('pattern-letter-spacing', 'pattern.letterSpacing');
    setupRangeControl('pattern-word-spacing', 'pattern.wordSpacing');
    setupRangeControl('pattern-animation-speed', 'pattern.animationSpeed');
    setupRangeControl('pattern-opacity', 'pattern.opacity');

    setupColorControl('pattern-background-color', 'pattern.backgroundColor');
    setupColorControl('pattern-text-color', 'pattern.textColor');
    setupColorControl('pattern-object-color', 'pattern.objectColor');

    setupToggleControl('pattern-animation-toggle', 'pattern.animatePattern');
    setupToggleControl('pattern-animation-reverse', 'pattern.animationReverse');

    const directionSelect = document.getElementById('pattern-animation-direction');
    if (directionSelect) {
        directionSelect.addEventListener('change', (e) => {
            projectionParams.pattern.animationDirection = e.target.value;
            if (projectionParams.enabled && projectionParams.projectionType === 'pattern') {
                createText();
            }
        });
    }
}