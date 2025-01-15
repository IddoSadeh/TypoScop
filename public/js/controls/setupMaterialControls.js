import { materialParams } from '../parameters/materialParams.js';
import { createText, updateMaterial } from '../utils/three.setup.js';

export function setupMaterialControls() {
    const colorPicker = document.getElementById('color-picker');
    const metalnessSlider = document.getElementById('metalness-slider');
    const roughnessSlider = document.getElementById('roughness-slider');
    const tessellationToggle = document.getElementById('tessellation-toggle');
    const tessellationDetail = document.getElementById('tessellation-detail');
    const tessHueStart = document.getElementById('tess-hue-start');
    const tessHueRange = document.getElementById('tess-hue-range');
    const tessSatStart = document.getElementById('tess-sat-start');
    const tessSatRange = document.getElementById('tess-sat-range');
    const tessLightStart = document.getElementById('tess-light-start');
    const tessLightRange = document.getElementById('tess-light-range');
    const tessPattern = document.getElementById('tess-pattern');

    // Color picker
    colorPicker?.addEventListener('input', (e) => {
        materialParams.color = e.target.value;
        updateMaterial();
        createText()
    });

    // Material sliders
    metalnessSlider?.addEventListener('input', (e) => {
        materialParams.metalness = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = materialParams.metalness;
        updateMaterial();
        createText()
    });

    roughnessSlider?.addEventListener('input', (e) => {
        materialParams.roughness = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = materialParams.roughness;
        updateMaterial();
        createText()
    });

   // Tessellation controls
   function setupRangeControl(element, paramName) {
    element?.addEventListener('input', (e) => {
        materialParams[paramName] = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = materialParams[paramName].toFixed(2);
        if (materialParams.tessellationEnabled) {
            createText();
        }
    });
}

tessellationToggle?.addEventListener('change', (e) => {
    materialParams.tessellationEnabled = e.target.checked;
    createText();
});

setupRangeControl(tessellationDetail, 'tessellationSegments');
setupRangeControl(tessHueStart, 'tessellationHueStart');
setupRangeControl(tessHueRange, 'tessellationHueRange');
setupRangeControl(tessSatStart, 'tessellationSatStart');
setupRangeControl(tessSatRange, 'tessellationSatRange');
setupRangeControl(tessLightStart, 'tessellationLightStart');
setupRangeControl(tessLightRange, 'tessellationLightRange');

tessPattern?.addEventListener('change', (e) => {
    materialParams.tessellationPattern = e.target.value;
    if (materialParams.tessellationEnabled) {
        createText();
    }
});

}