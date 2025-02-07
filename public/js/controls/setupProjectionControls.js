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

export function updateProjectionControls() {
  // Update basic projection controls
  const projectionToggle = document.getElementById('projection-toggle');
  const projectionType = document.getElementById('projection-type');
  const projectionMode = document.getElementById('projection-mode');

  if (projectionToggle) {
      projectionToggle.checked = projectionParams.enabled;
  }

  if (projectionType || projectionParams.pattern.enabled) {
      projectionType.value = projectionParams.projectionType;
  }

  if (projectionMode) {
      projectionMode.value = projectionParams.mode;
  }

  // Update pattern controls
  const updateRangeControl = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
          element.value = value;
          const valueDisplay = element.nextElementSibling;
          if (valueDisplay) {
              valueDisplay.textContent = value.toFixed(2);
          }
      }
  };

  // Update all range controls
  updateRangeControl('pattern-repeat-x', projectionParams.pattern.repeatX);
  updateRangeControl('pattern-repeat-y', projectionParams.pattern.repeatY);
  updateRangeControl('pattern-letter-spacing', projectionParams.pattern.letterSpacing);
  updateRangeControl('pattern-word-spacing', projectionParams.pattern.wordSpacing);
  updateRangeControl('pattern-animation-speed', projectionParams.pattern.animationSpeed);
  updateRangeControl('pattern-opacity', projectionParams.pattern.opacity);

  // Update color controls
  const backgroundColorPicker = document.getElementById('pattern-background-color');
  if (backgroundColorPicker) {
      backgroundColorPicker.value = projectionParams.pattern.backgroundColor;
  }

  const textColorPicker = document.getElementById('pattern-text-color');
  if (textColorPicker) {
      textColorPicker.value = projectionParams.pattern.textColor;
  }

  const objectColorPicker = document.getElementById('pattern-object-color');
  if (objectColorPicker) {
      objectColorPicker.value = projectionParams.pattern.objectColor;
  }

  // Update toggle controls
  const animationToggle = document.getElementById('pattern-animation-toggle');
  if (animationToggle) {
      animationToggle.checked = projectionParams.pattern.animatePattern;
  }

  const reverseToggle = document.getElementById('pattern-animation-reverse');
  if (reverseToggle) {
      reverseToggle.checked = projectionParams.pattern.animationReverse;
  }

  // Update direction select
  const directionSelect = document.getElementById('pattern-animation-direction');
  if (directionSelect) {
      directionSelect.value = projectionParams.pattern.animationDirection;
  }
}