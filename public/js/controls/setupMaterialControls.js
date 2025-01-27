// setupMaterialControls.js
import { materialParams } from '../parameters/materialParams.js';
import { createText } from '../utils/three.setup.js';
import { createMaterial } from '../utils/materialManager.js';

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
        createText();
    });

    // Material sliders
    metalnessSlider?.addEventListener('input', (e) => {
        materialParams.metalness = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = materialParams.metalness;
        createText();
    });

    roughnessSlider?.addEventListener('input', (e) => {
        materialParams.roughness = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = materialParams.roughness;
        createText();
    });
}

function setupManipulationControls() {
    // Get all necessary DOM elements
    const tessellationToggle = document.getElementById('tessellation-toggle');
    const wireframeToggle = document.getElementById('wireframe-toggle');
    const particleToggle = document.getElementById('particle-toggle');
    const tessellationSegments = document.getElementById('tessellation-segments');
    const tessellationDetail = document.getElementById('tessellation-detail');
    const manipulationAnimationControls = document.getElementById('manipulation-animation-controls');
    const colorPatternSection = document.getElementById('color-pattern-section');
    const particleControls = document.getElementById('particle-controls');
    
    const animationToggle = document.getElementById('manipulation-animation-toggle');
    const speedSlider = document.getElementById('manipulation-animation-speed');
    const intensitySlider = document.getElementById('manipulation-animation-intensity');

    // Helper function to update control states
    function updateControlStates() {
        const isTessellationActive = materialParams.tessellationEnabled;
        const isWireframeActive = materialParams.wireframeEnabled;
        const isParticleActive = materialParams.particlesEnabled;
        const isAnyManipulationActive = isTessellationActive || isWireframeActive || isParticleActive;

        // Animation controls visibility
        if (manipulationAnimationControls) {
            manipulationAnimationControls.classList.toggle('enabled', isAnyManipulationActive);
        }

        // Color pattern visibility (only for tessellation and wireframe)
        if (colorPatternSection) {
            colorPatternSection.classList.toggle('enabled', isTessellationActive || isWireframeActive);
        }

        // Tessellation segments visibility
        if (tessellationSegments) {
            tessellationSegments.style.display = isTessellationActive ? 'block' : 'none';
        }

        // Particle controls visibility
        if (particleControls) {
            particleControls.classList.toggle('enabled', isParticleActive);
        }
    }

    // Setup tessellation toggle
    tessellationToggle?.addEventListener('change', (e) => {
        if (e.target.checked) {
            materialParams.tessellationEnabled = true;
            materialParams.wireframeEnabled = false;
            materialParams.particlesEnabled = false;
            
            // Update other toggles
            if (wireframeToggle) wireframeToggle.checked = false;
            if (particleToggle) particleToggle.checked = false;
        } else {
            materialParams.tessellationEnabled = false;
        }
        
        updateControlStates();
        createText();
    });

    // Setup wireframe toggle
    wireframeToggle?.addEventListener('change', (e) => {
        if (e.target.checked) {
            materialParams.wireframeEnabled = true;
            materialParams.tessellationEnabled = false;
            materialParams.particlesEnabled = false;
            
            // Update other toggles
            if (tessellationToggle) tessellationToggle.checked = false;
            if (particleToggle) particleToggle.checked = false;
        } else {
            materialParams.wireframeEnabled = false;
        }
        
        updateControlStates();
        createText();
    });

    // Setup particle toggle
    particleToggle?.addEventListener('change', (e) => {
        if (e.target.checked) {
            materialParams.particlesEnabled = true;
            materialParams.tessellationEnabled = false;
            materialParams.wireframeEnabled = false;
            
            // Update other toggles
            if (tessellationToggle) tessellationToggle.checked = false;
            if (wireframeToggle) wireframeToggle.checked = false;
        } else {
            materialParams.particlesEnabled = false;
        }
        
        updateControlStates();
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

    // Setup shared animation controls
    animationToggle?.addEventListener('change', (e) => {
        materialParams.manipulationAnimationEnabled = e.target.checked;
        if (!e.target.checked) {
            createText();
        }
    });

    speedSlider?.addEventListener('input', (e) => {
        materialParams.manipulationAnimationSpeed = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = 
            materialParams.manipulationAnimationSpeed.toFixed(1);
    });

    intensitySlider?.addEventListener('input', (e) => {
        materialParams.manipulationAnimationIntensity = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = 
            materialParams.manipulationAnimationIntensity.toFixed(1);
    });

    // Setup particle controls
    const shapeSelect = document.getElementById('particle-shape');
    const sizeSlider = document.getElementById('particle-size');
    const densitySlider = document.getElementById('particle-density');
    const randomnessSlider = document.getElementById('particle-randomness');
    const scaleSlider = document.getElementById('particle-scale');

    // Shape selection
    shapeSelect?.addEventListener('change', (e) => {
        materialParams.particleShape = e.target.value;
        if (materialParams.particlesEnabled) {
            createText();
        }
    });

    // Setup particle sliders
    function setupParticleSlider(slider, valueKey, formatDecimals = 2) {
        slider?.addEventListener('input', (e) => {
            materialParams[valueKey] = parseFloat(e.target.value);
            const valueDisplay = e.target.nextElementSibling;
            if (valueDisplay) {
                valueDisplay.textContent = materialParams[valueKey].toFixed(formatDecimals);
            }
            if (materialParams.particlesEnabled) {
                createText();
            }
        });
    }

    setupParticleSlider(sizeSlider, 'particleSize');
    setupParticleSlider(densitySlider, 'particleDensity', 1);
    setupParticleSlider(randomnessSlider, 'particleRandomness');
    setupParticleSlider(scaleSlider, 'particleScale', 1);

    // Initialize control states
    updateControlStates();
}

function setupColorPatternControls() {
    function setupRangeControl(elementId, paramName) {
        const element = document.getElementById(elementId);
        element?.addEventListener('input', (e) => {
            materialParams[paramName] = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = materialParams[paramName].toFixed(2);
            if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
                createText();
            }
        });
    }

    setupRangeControl('color-hue-start', 'colorHueStart');
    setupRangeControl('color-hue-range', 'colorHueRange');
    setupRangeControl('color-sat-start', 'colorSatStart');
    setupRangeControl('color-sat-range', 'colorSatRange');
    setupRangeControl('color-light-start', 'colorLightStart');
    setupRangeControl('color-light-range', 'colorLightRange');

    const patternSelect = document.getElementById('color-pattern');
    patternSelect?.addEventListener('change', (e) => {
        materialParams.colorPattern = e.target.value;
        if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
            createText();
        }
    });
}