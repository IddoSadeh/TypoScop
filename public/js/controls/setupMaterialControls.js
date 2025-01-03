import { materialParams } from '../parameters/materialParams.js';
import { updateMaterial } from '../utils/three.setup.js';

export function setupMaterialControls() {
    const colorPicker = document.getElementById('color-picker');
    const metalnessSlider = document.getElementById('metalness-slider');
    const roughnessSlider = document.getElementById('roughness-slider');

    // Color picker
    colorPicker?.addEventListener('input', (e) => {
        materialParams.color = e.target.value;
        updateMaterial();
    });

    // Material sliders
    metalnessSlider?.addEventListener('input', (e) => {
        materialParams.metalness = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = materialParams.metalness;
        updateMaterial();
    });

    roughnessSlider?.addEventListener('input', (e) => {
        materialParams.roughness = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = materialParams.roughness;
        updateMaterial();
    });
}