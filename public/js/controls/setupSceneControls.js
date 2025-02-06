// controls/setupSceneControls.js
import { sceneParams } from '../parameters/sceneParams.js';
import { updateSceneBackground, updateSceneLighting, updateSceneCamera } from '../utils/three.setup.js';
import { createText } from '../utils/three.setup.js';

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

    // Background event listeners
    backgroundPicker?.addEventListener('input', (e) => {
        sceneParams.backgroundColor = e.target.value;
        updateSceneBackground();
createText();
    });

    backgroundOpacity?.addEventListener('input', (e) => {
        sceneParams.backgroundOpacity = parseFloat(e.target.value);
        updateSceneBackground();
createText();
        e.target.nextElementSibling.textContent = e.target.value;
    });

    // Fog event listeners
    fogToggle?.addEventListener('change', (e) => {
        sceneParams.fogEnabled = e.target.checked;
        updateSceneBackground();
createText();
    });

    fogColorPicker?.addEventListener('input', (e) => {
        sceneParams.fogColor = e.target.value;
        updateSceneBackground();
createText();
    });

    fogDensity?.addEventListener('input', (e) => {
        sceneParams.fogDensity = parseFloat(e.target.value);
        updateSceneBackground();
createText();
        e.target.nextElementSibling.textContent = e.target.value;
    });

    // Lighting event listeners
    ambientLight?.addEventListener('input', (e) => {
        sceneParams.ambientLightIntensity = parseFloat(e.target.value);
        updateSceneLighting();
        e.target.nextElementSibling.textContent = e.target.value;
    });

    mainLight?.addEventListener('input', (e) => {
        sceneParams.mainLightIntensity = parseFloat(e.target.value);
        updateSceneLighting();
        e.target.nextElementSibling.textContent = e.target.value;
    });

    fillLight?.addEventListener('input', (e) => {
        sceneParams.fillLightIntensity = parseFloat(e.target.value);
        updateSceneLighting();
        e.target.nextElementSibling.textContent = e.target.value;
    });

    // Camera event listeners
    cameraDistance?.addEventListener('input', (e) => {
        sceneParams.cameraDistance = parseFloat(e.target.value);
        updateSceneCamera();
        e.target.nextElementSibling.textContent = e.target.value;
    });

    fieldOfView?.addEventListener('input', (e) => {
        sceneParams.fieldOfView = parseFloat(e.target.value);
        updateSceneCamera();
        e.target.nextElementSibling.textContent = e.target.value;
    });

    // Initialize all controls with current values
    if (backgroundPicker) backgroundPicker.value = sceneParams.backgroundColor;
    if (backgroundOpacity) {
        backgroundOpacity.value = sceneParams.backgroundOpacity;
        backgroundOpacity.nextElementSibling.textContent = sceneParams.backgroundOpacity;
    }
    if (fogToggle) fogToggle.checked = sceneParams.fogEnabled;
    if (fogColorPicker) fogColorPicker.value = sceneParams.fogColor;
    if (fogDensity) {
        fogDensity.value = sceneParams.fogDensity;
        fogDensity.nextElementSibling.textContent = sceneParams.fogDensity;
    }
    // ... Initialize other controls similarly
}