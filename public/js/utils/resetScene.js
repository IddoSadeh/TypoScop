import * as THREE from 'three';
import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';
import { projectionParams } from '../parameters/projectionParams.js';
import { createText, getTextMesh, getCamera, updateSceneBackground } from '../utils/three.setup.js';
import { updateMultiTextCopies } from './animationManager.js';

// Store default parameters
const defaultParams = {
    text: {
        text: 'Hello World',
        font: "helvetiker",   
        size: 5,
        height: 2,
        letterSpacing: 0.5,  
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.3,
        bevelSegments: 5
    },
    material: {
        color: '#ffffff',
        metalness: 0,
        roughness: 0.5,
        tessellationEnabled: false,
        wireframeEnabled: false,
        particlesEnabled: false
    },
    scene: {
        backgroundColor: '#000000',
        backgroundOpacity: 1.0,
        fogEnabled: false,
        fogColor: '#000000',
        fogDensity: 0.1,
        ambientLightIntensity: 0.5,
        mainLightIntensity: 0.8,
        fillLightIntensity: 0.5,
        cameraDistance: 30,
        fieldOfView: 45
    },
    animation: {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        rotateXEnabled: false,
        rotateYEnabled: false,
        rotateZEnabled: false,
        scaleEnabled: false,
        scrambleEnabled: false,
        multiTextEnabled: false
    },
    projection: {
        enabled: false,
        projectionType: 'standard',
        mode: 'torusknot',
        scale: 1.0,
        repeat: 10
    }
};

export function resetScene() {
    // Reset all parameters to defaults
    Object.assign(textParams, defaultParams.text);
    Object.assign(materialParams, defaultParams.material);
    Object.assign(sceneParams, defaultParams.scene);
    Object.assign(animationParams, defaultParams.animation);
    Object.assign(projectionParams, defaultParams.projection);

    // Reset UI controls
    updateUIControls();
    updateSceneBackground();
    updateMultiTextCopies();
    // First recreate the text with default parameters
    createText();

    // After text is created, get the mesh and center it
    setTimeout(() => {
        const textMesh = getTextMesh();
        const camera = getCamera();

        if (textMesh) {
            // Reset rotation
            textMesh.rotation.set(0, 0, 0);
            
            // Center the text
            textMesh.geometry.computeBoundingBox();
            const boundingBox = textMesh.geometry.boundingBox;
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            
            // Calculate text dimensions
            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            
            // Position text at origin, centered
            textMesh.position.set(-center.x, -center.y, -center.z);
            
            // Calculate ideal camera distance based on text size
            const maxDimension = Math.max(size.x, size.y);
            const idealDistance = (maxDimension / 2) / Math.tan(THREE.MathUtils.degToRad(sceneParams.fieldOfView / 2));
            sceneParams.cameraDistance = Math.max(idealDistance * 1.2, 30); // Add 20% margin
        }

        if (camera) {
            // Reset camera position and orientation
            camera.position.set(0, 0, sceneParams.cameraDistance);
            camera.rotation.set(0, 0, 0);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }
    }, 100); // Small delay to ensure text is created
}



function updateUIControls() {
    // Update text input
    const textInput = document.getElementById('ai-text-input');
    if (textInput) textInput.value = textParams.text;

    // Update font select
    const fontSelect = document.getElementById('ai-font-name');
    if (fontSelect) fontSelect.value = textParams.font;

    // Update all checkboxes
    const checkboxes = {
        'rotate-x-toggle': animationParams.rotateXEnabled,
        'rotate-y-toggle': animationParams.rotateYEnabled,
        'rotate-z-toggle': animationParams.rotateZEnabled,
        'scale-toggle': animationParams.scaleEnabled,
        'scramble-toggle': animationParams.scrambleEnabled,
        'multi-text-toggle': animationParams.multiTextEnabled,
        'tessellation-toggle': materialParams.tessellationEnabled,
        'wireframe-toggle': materialParams.wireframeEnabled,
        'particle-toggle': materialParams.particlesEnabled,
        'fog-toggle': sceneParams.fogEnabled,
        'projection-toggle': projectionParams.enabled
    };

    Object.entries(checkboxes).forEach(([id, value]) => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = value;
    });

    // Update all range inputs
    const rangeInputs = {
        'text-height-slider': textParams.height,
        'letter-spacing-slider': textParams.letterSpacing,
        'metalness-slider': materialParams.metalness,
        'roughness-slider': materialParams.roughness,
        'camera-distance': sceneParams.cameraDistance,
        'field-of-view': sceneParams.fieldOfView
    };

    Object.entries(rangeInputs).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = value;
            const valueDisplay = input.nextElementSibling;
            if (valueDisplay) valueDisplay.textContent = value;
        }
    });

    // Update color inputs
    const colorInputs = {
        'color-picker': materialParams.color,
        'background-color': defaultParams.backgroundColor,
        'fog-color': sceneParams.fogColor
    };

    Object.entries(colorInputs).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) input.value = value;
    });
}

// Initialize reset button
export function initResetButton() {
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the scene to default settings?')) {
                resetScene();
            }
        });
    }
}