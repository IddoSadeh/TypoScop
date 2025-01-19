import { materialParams } from '../parameters/materialParams.js';
import { createText, updateMaterial } from '../utils/three.setup.js';

export function setupMaterialControls() {
    setupBasicMaterialControls();
    setupManipulationControls();
    setupColorPatternControls();
}

function setupBasicMaterialControls() {
    const colorPicker = document.getElementById('color-picker');
    const metalnessSlider = document.getElementById('metalness-slider');
    const roughnessSlider = document.getElementById('roughness-slider');

    // Color picker
    colorPicker?.addEventListener('input', (e) => {
        materialParams.color = e.target.value;
        materialParams.basicMaterialColor = e.target.value;
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

export function setupManipulationControls() {
    // Get all necessary DOM elements
    const tessellationToggle = document.getElementById('tessellation-toggle');
    const wireframeToggle = document.getElementById('wireframe-toggle');
    const tessellationSegments = document.getElementById('tessellation-segments');
    const tessellationDetail = document.getElementById('tessellation-detail');
    const manipulationAnimationControls = document.getElementById('manipulation-animation-controls');
    const colorPatternSection = document.getElementById('color-pattern-section');
    
    const animationToggle = document.getElementById('manipulation-animation-toggle');
    const speedSlider = document.getElementById('manipulation-animation-speed');
    const intensitySlider = document.getElementById('manipulation-animation-intensity');

    // Helper function to update control states
    function updateControlStates(isManipulationActive) {
        // Enable/disable animation controls
        if (manipulationAnimationControls) {
            if (isManipulationActive) {
                manipulationAnimationControls.classList.add('enabled');
            } else {
                manipulationAnimationControls.classList.remove('enabled');
                if (animationToggle) animationToggle.checked = false;
            }
        }

        // Enable/disable color pattern controls
        if (colorPatternSection) {
            if (isManipulationActive) {
                colorPatternSection.classList.add('enabled');
            } else {
                colorPatternSection.classList.remove('enabled');
            }
        }

        // Show/hide tessellation segments control
        if (tessellationSegments) {
            tessellationSegments.style.display = 
                (tessellationToggle && tessellationToggle.checked) ? 'block' : 'none';
        }
    }

    // Setup tessellation toggle
    tessellationToggle?.addEventListener('change', (e) => {
        if (e.target.checked) {
            materialParams.tessellationEnabled = true;
            materialParams.wireframeEnabled = false;
            if (wireframeToggle) wireframeToggle.checked = false;
        } else {
            materialParams.tessellationEnabled = false;
        }
        
        updateControlStates(e.target.checked);
        createText();
    });

    // Setup wireframe toggle
    wireframeToggle?.addEventListener('change', (e) => {
        if (e.target.checked) {
            materialParams.wireframeEnabled = true;
            materialParams.tessellationEnabled = false;
            if (tessellationToggle) tessellationToggle.checked = false;
        } else {
            materialParams.wireframeEnabled = false;
        }
        
        updateControlStates(e.target.checked);
        createText();
    });

    // Setup tessellation detail slider
    tessellationDetail?.addEventListener('input', (e) => {
        materialParams.tessellationSegments = parseInt(e.target.value);
        e.target.nextElementSibling.textContent = materialParams.tessellationSegments;
        if (materialParams.tessellationEnabled) {
            createText();
        }
    });

    // Setup animation controls
    animationToggle?.addEventListener('change', (e) => {
        const isAnimationEnabled = e.target.checked;
        if (materialParams.tessellationEnabled) {
            materialParams.tessellationAnimationEnabled = isAnimationEnabled;
        } else if (materialParams.wireframeEnabled) {
            materialParams.wireframeAnimationEnabled = isAnimationEnabled;
        }

        if (!isAnimationEnabled) {
            // Reset animation values
            if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
                updateMaterial();
            }
        }
    });

    speedSlider?.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        if (materialParams.tessellationEnabled) {
            materialParams.tessellationAnimationSpeed = speed;
        } else if (materialParams.wireframeEnabled) {
            materialParams.wireframeAnimationSpeed = speed;
        }
        e.target.nextElementSibling.textContent = speed.toFixed(1);
    });

    intensitySlider?.addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        if (materialParams.tessellationEnabled) {
            materialParams.tessellationAnimationIntensity = intensity;
        } else if (materialParams.wireframeEnabled) {
            materialParams.wireframeAnimationAmplitude = intensity;
        }
        e.target.nextElementSibling.textContent = intensity.toFixed(1);
    });

    // Setup color pattern controls
    setupColorPatternControls();
}

function setupColorPatternControls() {
    // Helper function to setup range controls
    function setupRangeControl(elementId, paramName) {
        const element = document.getElementById(elementId);
        element?.addEventListener('input', (e) => {
            materialParams[paramName] = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = materialParams[paramName].toFixed(2);
            if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
                updateMaterial();
            }
        });
    }

    // Setup all range controls
    setupRangeControl('color-hue-start', 'colorHueStart');
    setupRangeControl('color-hue-range', 'colorHueRange');
    setupRangeControl('color-sat-start', 'colorSatStart');
    setupRangeControl('color-sat-range', 'colorSatRange');
    setupRangeControl('color-light-start', 'colorLightStart');
    setupRangeControl('color-light-range', 'colorLightRange');

    // Setup pattern selector
    const patternSelect = document.getElementById('color-pattern');
    patternSelect?.addEventListener('change', (e) => {
        materialParams.colorPattern = e.target.value;
        if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
            updateMaterial();
        }
    });
}