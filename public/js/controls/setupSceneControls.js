// controls/setupSceneControls.js
import { sceneParams } from '../parameters/sceneParams.js';
import { updateSceneBackground, updateSceneLighting, updateSceneCamera, updateScenePosition } from '../utils/three.setup.js';

export function setupSceneControls() {
    // Background controls
    const backgroundPicker = document.getElementById('background-color');
    const backgroundOpacity = document.getElementById('background-opacity');

    // Fog controls
    const fogToggle = document.getElementById('fog-toggle');
    const fogColorPicker = document.getElementById('fog-color');
    const fogDensity = document.getElementById('fog-density');

    // Lighting controls
    const ambientLight = document.getElementById('ambient-light');
    const mainLight = document.getElementById('main-light');
    const fillLight = document.getElementById('fill-light');

    // Camera controls
    const cameraDistance = document.getElementById('camera-distance');
    const fieldOfView = document.getElementById('field-of-view');

    // Position controls
    const positionX = document.getElementById('scene-position-x');
    const positionY = document.getElementById('scene-position-y');
    const resetPosition = document.getElementById('reset-scene-position');

    // Background event listeners
    backgroundPicker?.addEventListener('input', (e) => {
        sceneParams.backgroundColor = e.target.value;
        updateSceneBackground();
    });

    backgroundOpacity?.addEventListener('input', (e) => {
        sceneParams.backgroundOpacity = parseFloat(e.target.value);
        updateSceneBackground();
        e.target.nextElementSibling.textContent = sceneParams.backgroundOpacity.toFixed(1);
    });

    // Fog event listeners
    fogToggle?.addEventListener('change', (e) => {
        sceneParams.fogEnabled = e.target.checked;
        updateSceneCamera();
    });

    fogColorPicker?.addEventListener('input', (e) => {
        sceneParams.fogColor = e.target.value;
        updateSceneCamera();
    });

    fogDensity?.addEventListener('input', (e) => {
        sceneParams.fogDensity = parseFloat(e.target.value);
        updateSceneCamera();
        e.target.nextElementSibling.textContent = sceneParams.fogDensity.toFixed(2);
    });

    // Lighting event listeners
    ambientLight?.addEventListener('input', (e) => {
        sceneParams.ambientLightIntensity = parseFloat(e.target.value);
        updateSceneLighting();
        e.target.nextElementSibling.textContent = sceneParams.ambientLightIntensity.toFixed(1);
    });

    mainLight?.addEventListener('input', (e) => {
        sceneParams.mainLightIntensity = parseFloat(e.target.value);
        updateSceneLighting();
        e.target.nextElementSibling.textContent = sceneParams.mainLightIntensity.toFixed(1);
    });

    fillLight?.addEventListener('input', (e) => {
        sceneParams.fillLightIntensity = parseFloat(e.target.value);
        updateSceneLighting();
        e.target.nextElementSibling.textContent = sceneParams.fillLightIntensity.toFixed(1);
    });

    // Camera event listeners
    cameraDistance?.addEventListener('input', (e) => {
        sceneParams.cameraDistance = parseFloat(e.target.value);
        updateSceneCamera();
        e.target.nextElementSibling.textContent = sceneParams.cameraDistance.toFixed(0);
    });

    fieldOfView?.addEventListener('input', (e) => {
        sceneParams.fieldOfView = parseFloat(e.target.value);
        updateSceneCamera();
        e.target.nextElementSibling.textContent = sceneParams.fieldOfView.toFixed(0);
    });

    // Position event listeners
    positionX?.addEventListener('input', (e) => {
        sceneParams.position.x = parseFloat(e.target.value);
        updateScenePosition();
        e.target.nextElementSibling.textContent = sceneParams.position.x.toFixed(0);
    });

    positionY?.addEventListener('input', (e) => {
        sceneParams.position.y = parseFloat(e.target.value);
        updateScenePosition();
        e.target.nextElementSibling.textContent = sceneParams.position.y.toFixed(0);
    });

    // Reset position button
    resetPosition?.addEventListener('click', () => {
        sceneParams.position.x = 0;
        sceneParams.position.y = 0;
        
        // Update slider positions
        if (positionX) {
            positionX.value = "0";
            positionX.nextElementSibling.textContent = "0";
        }
        if (positionY) {
            positionY.value = "0";
            positionY.nextElementSibling.textContent = "0";
        }
        
        updateScenePosition();
    });

    // Initialize all controls with current values
    function initializeControls() {
        // Background controls initialization
        if (backgroundPicker) {
            backgroundPicker.value = sceneParams.backgroundColor;
        }
        if (backgroundOpacity) {
            backgroundOpacity.value = sceneParams.backgroundOpacity;
            backgroundOpacity.nextElementSibling.textContent = sceneParams.backgroundOpacity.toFixed(1);
        }

        // Fog controls initialization
        if (fogToggle) {
            fogToggle.checked = sceneParams.fogEnabled;
        }
        if (fogColorPicker) {
            fogColorPicker.value = sceneParams.fogColor;
        }
        if (fogDensity) {
            fogDensity.value = sceneParams.fogDensity;
            fogDensity.nextElementSibling.textContent = sceneParams.fogDensity.toFixed(2);
        }

        // Lighting controls initialization
        if (ambientLight) {
            ambientLight.value = sceneParams.ambientLightIntensity;
            ambientLight.nextElementSibling.textContent = sceneParams.ambientLightIntensity.toFixed(1);
        }
        if (mainLight) {
            mainLight.value = sceneParams.mainLightIntensity;
            mainLight.nextElementSibling.textContent = sceneParams.mainLightIntensity.toFixed(1);
        }
        if (fillLight) {
            fillLight.value = sceneParams.fillLightIntensity;
            fillLight.nextElementSibling.textContent = sceneParams.fillLightIntensity.toFixed(1);
        }

        // Camera controls initialization
        if (cameraDistance) {
            cameraDistance.value = sceneParams.cameraDistance;
            cameraDistance.nextElementSibling.textContent = sceneParams.cameraDistance.toFixed(0);
        }
        if (fieldOfView) {
            fieldOfView.value = sceneParams.fieldOfView;
            fieldOfView.nextElementSibling.textContent = sceneParams.fieldOfView.toFixed(0);
        }

        // Position controls initialization
        if (positionX) {
            positionX.value = sceneParams.position.x;
            positionX.nextElementSibling.textContent = sceneParams.position.x.toFixed(0);
        }
        if (positionY) {
            positionY.value = sceneParams.position.y;
            positionY.nextElementSibling.textContent = sceneParams.position.y.toFixed(0);
        }
    }

    // Initialize all controls
    initializeControls();

    // Initial updates to ensure scene matches controls
    updateSceneBackground();
    updateSceneLighting();
    updateSceneCamera();
    updateScenePosition();
}