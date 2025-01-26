// setupSceneControls.js
import { sceneParams } from '../parameters/sceneParams.js';
import { updateSceneBackground } from '../utils/three.setup.js';

export function setupSceneControls() {
    const backgroundPicker = document.getElementById('background-color');

    backgroundPicker?.addEventListener('input', (e) => {
        sceneParams.backgroundColor = e.target.value;
        updateSceneBackground();
    });
    
    // Initialize background color
    if (backgroundPicker && sceneParams.backgroundColor) {
        backgroundPicker.value = sceneParams.backgroundColor;
    }
}