// controls/setupProjectionControls.js
import { projectionParams } from '../parameters/projectionParams.js';
import { createText } from '../utils/three.setup.js';

export function setupProjectionControls(projectionManager) {
    const projectionToggle = document.getElementById('projection-toggle');
    const projectionModeSelect = document.getElementById('projection-mode');
    const projectionScaleSlider = document.getElementById('projection-scale');
    const projectionScaleValue = document.getElementById('projection-scale-value');

    if (projectionToggle) {
        projectionToggle.addEventListener('change', (e) => {
            projectionParams.enabled = e.target.checked;
            createText(); // Recreate text with new projection settings
        });
    }

    if (projectionModeSelect) {
        projectionModeSelect.addEventListener('change', (e) => {
            projectionParams.mode = e.target.value;
            if (projectionParams.enabled) {
                createText(); // Recreate text with new projection mode
            }
        });
    }

    if (projectionScaleSlider) {
        projectionScaleSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            projectionParams.scale = value;
            if (projectionParams.enabled) {
                projectionManager.updateScale(value);
            }
            if (projectionScaleValue) {
                projectionScaleValue.textContent = value.toFixed(1);
            }
        });
    }
}