    // setupMaterialControls.js
    import { materialParams } from '../parameters/materialParams.js';
    import { createText } from '../utils/three.setup.js';
    import { createMaterial } from '../utils/materialManager.js';

    export function setupMaterialControls() {
        setupBasicMaterialControls();
        setupManipulationControls();
        setupParticleControls();
        setupColorPatternControls();
    }
    function setupParticleControls() {
        // Get DOM elements
        const particleToggle = document.getElementById('particle-toggle');
        const shapeSelect = document.getElementById('particle-shape');
        const sizeSlider = document.getElementById('particle-size');
        const densitySlider = document.getElementById('particle-density');
        const randomnessSlider = document.getElementById('particle-randomness');
        const scaleSlider = document.getElementById('particle-scale');
        const animationToggle = document.getElementById('particle-animation-toggle');
        const speedSlider = document.getElementById('particle-animation-speed');
        const intensitySlider = document.getElementById('particle-animation-intensity');

        // Helper function to update control states
        function updateControlStates(isEnabled) {
            const controls = document.querySelector('.particle-controls');
            if (controls) {
                controls.classList.toggle('enabled', isEnabled);
            }
        }

        // Particle toggle
        particleToggle?.addEventListener('change', (e) => {
            if (e.target.checked) {
                materialParams.particlesEnabled = true;
                materialParams.wireframeEnabled = false;
                materialParams.tessellationEnabled = false;
                
                // Update other toggles
                const wireframeToggle = document.getElementById('wireframe-toggle');
                const tessellationToggle = document.getElementById('tessellation-toggle');
                if (wireframeToggle) wireframeToggle.checked = false;
                if (tessellationToggle) tessellationToggle.checked = false;
            } else {
                materialParams.particlesEnabled = false;
            }
            
            updateControlStates(e.target.checked);
            createText();
        });

        // Shape selection
        shapeSelect?.addEventListener('change', (e) => {
            materialParams.particleShape = e.target.value;
            if (materialParams.particlesEnabled) {
                createText();
            }
        });

        // Setup range sliders
        function setupRangeSlider(slider, valueKey, formatDecimals = 2) {
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

        setupRangeSlider(sizeSlider, 'particleSize');
        setupRangeSlider(densitySlider, 'particleDensity', 1);
        setupRangeSlider(randomnessSlider, 'particleRandomness');
        setupRangeSlider(scaleSlider, 'particleScale', 1);

        // Animation controls
        animationToggle?.addEventListener('change', (e) => {
            materialParams.manipulationAnimationEnabled = e.target.checked;
        });

        speedSlider?.addEventListener('input', (e) => {
            materialParams.manipulationAnimationSpeed = parseFloat(e.target.value);
            const valueDisplay = e.target.nextElementSibling;
            if (valueDisplay) {
                valueDisplay.textContent = materialParams.manipulationAnimationSpeed.toFixed(1);
            }
        });

        intensitySlider?.addEventListener('input', (e) => {
            materialParams.manipulationAnimationIntensity = parseFloat(e.target.value);
            const valueDisplay = e.target.nextElementSibling;
            if (valueDisplay) {
                valueDisplay.textContent = materialParams.manipulationAnimationIntensity.toFixed(1);
            }
        });

        // Initialize states
        updateControlStates(materialParams.particlesEnabled);
    }
    function setupBasicMaterialControls() {
        const colorPicker = document.getElementById('color-picker');
        const metalnessSlider = document.getElementById('metalness-slider');
        const roughnessSlider = document.getElementById('roughness-slider');

        // Color picker
        colorPicker?.addEventListener('input', (e) => {
            materialParams.color = e.target.value;
            materialParams.basicMaterialColor = e.target.value;
            createText(); // Use createText instead of updateMaterial
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
        const tessellationSegments = document.getElementById('tessellation-segments');
        const tessellationDetail = document.getElementById('tessellation-detail');
        const manipulationAnimationControls = document.getElementById('manipulation-animation-controls');
        const colorPatternSection = document.getElementById('color-pattern-section');
        
        const animationToggle = document.getElementById('manipulation-animation-toggle');
        const speedSlider = document.getElementById('manipulation-animation-speed');
        const intensitySlider = document.getElementById('manipulation-animation-intensity');

        // Helper function to update control states
        function updateControlStates(isManipulationActive) {
            if (manipulationAnimationControls) {
                manipulationAnimationControls.classList.toggle('enabled', isManipulationActive);
                if (!isManipulationActive && animationToggle) {
                    animationToggle.checked = false;
                }
            }

            if (colorPatternSection) {
                colorPatternSection.classList.toggle('enabled', isManipulationActive);
            }

            if (tessellationSegments) {
                tessellationSegments.style.display = 
                    (tessellationToggle && tessellationToggle.checked) ? 'block' : 'none';
            }
        }

        // Setup tessellation toggle
        tessellationToggle?.addEventListener('change', (e) => {
            materialParams.tessellationEnabled = e.target.checked;
            if (e.target.checked && wireframeToggle) {
                materialParams.wireframeEnabled = false;
                wireframeToggle.checked = false;
            }
            updateControlStates(e.target.checked);
            createText();
        });

        // Setup wireframe toggle
        wireframeToggle?.addEventListener('change', (e) => {
            materialParams.wireframeEnabled = e.target.checked;
            if (e.target.checked && tessellationToggle) {
                materialParams.tessellationEnabled = false;
                tessellationToggle.checked = false;
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
        setupAnimationControls(animationToggle, speedSlider, intensitySlider);
    }

    function setupAnimationControls(animationToggle, speedSlider, intensitySlider) {
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