import { materialParams } from '../parameters/materialParams.js';
import { createText, updateMaterial } from '../utils/three.setup.js';

function setupTessellationAnimationControls() {
    const animationToggle = document.getElementById('tessellation-animation-toggle');
    const speedSlider = document.getElementById('tessellation-animation-speed');
    const intensitySlider = document.getElementById('tessellation-animation-intensity');
    const animationControls = document.getElementById('tessellation-animation-controls');
    const animationInputs = animationControls?.querySelectorAll('input');

    // Initialize animation controls state
    const updateAnimationControlsState = (enabled) => {
        if (animationControls) {
            if (enabled) {
                animationControls.classList.add('enabled');
                animationInputs?.forEach(input => input.disabled = false);
            } else {
                animationControls.classList.remove('enabled');
                animationInputs?.forEach(input => input.disabled = true);
            }
        }
    };

    // Set initial state
    updateAnimationControlsState(materialParams.tessellationEnabled);

    animationToggle?.addEventListener('change', (e) => {
        materialParams.tessellationAnimationEnabled = e.target.checked;
        // Reset animation values if being disabled
        if (!e.target.checked && textMesh && textMesh.material.uniforms) {
            textMesh.material.uniforms.amplitude.value = 0;
        }
    });

    speedSlider?.addEventListener('input', (e) => {
        materialParams.tessellationAnimationSpeed = parseFloat(e.target.value);
        const valueDisplay = e.target.nextElementSibling;
        if (valueDisplay) {
            valueDisplay.textContent = materialParams.tessellationAnimationSpeed.toFixed(1);
        }
    });

    intensitySlider?.addEventListener('input', (e) => {
        materialParams.tessellationAnimationIntensity = parseFloat(e.target.value);
        const valueDisplay = e.target.nextElementSibling;
        if (valueDisplay) {
            valueDisplay.textContent = materialParams.tessellationAnimationIntensity.toFixed(1);
        }
    });

    // Update tessellation toggle to handle animation controls
    const tessellationToggle = document.getElementById('tessellation-toggle');
    tessellationToggle?.addEventListener('change', (e) => {
        materialParams.tessellationEnabled = e.target.checked;
        updateAnimationControlsState(e.target.checked);
        
        // Reset animation if tessellation is disabled
        if (!e.target.checked) {
            if (animationToggle) {
                animationToggle.checked = false;
                materialParams.tessellationAnimationEnabled = false;
            }
        }
        createText();
    });
}

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
setupTessellationAnimationControls();
}