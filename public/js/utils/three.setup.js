// three.setup.js
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';
import { createMaterial, updateMaterialUniforms, updateParticleAnimation } from './materialManager.js';
import { initAnimationManager, updateAnimation, updateMultiTextCopies, getLetterMeshes } from './animationManager.js';
import fontManager from './fontManager.js';

let scene, camera, renderer, textMesh, controls;

export function initThreeJS(container) {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneParams.backgroundColor);

    // Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 30;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    setupLighting();
    
    // Preload fonts then create initial text
    fontManager.preloadFonts().then(() => {
        createText();
    });
    
    animate();

    // Initialize animation manager
    initAnimationManager(scene, textMesh);

    // Window resize handler
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-10, -10, -10);
    scene.add(fillLight);
}

export function createText() {
    // Process text and get the appropriate font.
    const { text, font: selectedFont, isHebrew } = fontManager.processText(textParams.text, textParams.font);
    textParams.font = selectedFont;
    
    fontManager.loadFont(selectedFont, isHebrew)
      .then((font) => {
        try {
          // Create the text geometry.
          const geometry = new TextGeometry(text, {
            font: font,
            size: textParams.size,
            height: textParams.height,
            curveSegments: textParams.curveSegments,
            bevelEnabled: textParams.bevelEnabled,
            bevelThickness: textParams.bevelThickness,
            bevelSize: textParams.bevelSize,
            bevelSegments: textParams.bevelSegments
          });
          
          // Build the material (or particle mesh) using your new createMaterial.
          const materialObject = createMaterial(geometry);
          
          // Preserve the old transformation, if any.
          const oldPosition = textMesh ? textMesh.position.clone() : new THREE.Vector3();
          const oldRotation = textMesh ? textMesh.rotation.clone() : new THREE.Euler();
          
          // Remove and dispose of the old mesh.
          if (textMesh) {
            scene.remove(textMesh);
            if (textMesh.geometry) textMesh.geometry.dispose();
            if (textMesh.material) textMesh.material.dispose();
          }
          
          // For particle materials, materialObject.mesh exists; otherwise, create a normal Mesh.
          if (materialObject.mesh) {
            textMesh = materialObject.mesh;
          } else {
            textMesh = new THREE.Mesh(materialObject.geometry, materialObject.material);
          }
          
          // Compute the bounding box and center the text.
          geometry.computeBoundingBox();
          const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
          textMesh.position.copy(oldPosition);
          textMesh.position.x = centerOffset;
          textMesh.rotation.copy(oldRotation);
          
          // Add the new text mesh to the scene.
          scene.add(textMesh);
          camera.lookAt(textMesh.position);
          
          // Reinitialize the animation manager with the new text mesh.
          initAnimationManager(scene, textMesh);
          
          // If multi-copy mode is enabled, update the copies.
          if (animationParams.multiTextEnabled) {
            updateMultiTextCopies();
          }
        } catch (error) {
          console.error('Error creating text geometry:', error);
        }
      })
      .catch((error) => {
        console.error('Error loading font:', error);
      });
  }
  
export function updateMaterial() {
    if (!textMesh) return;

    const materialObject = createMaterial(textMesh.geometry.clone());
    
    // Store current transform
    const oldPosition = textMesh.position.clone();
    const oldRotation = textMesh.rotation.clone();
    const oldScale = textMesh.scale.clone();
    
    // Clean up old mesh
    scene.remove(textMesh);
    textMesh.geometry.dispose();
    textMesh.material.dispose();
    
    // Update with new geometry and material
    if (materialObject.mesh) {
        textMesh = materialObject.mesh;
    } else {
        textMesh = new THREE.Mesh(
            materialObject.geometry, 
            materialObject.material
        );
    }
    
    // Restore transform
    textMesh.position.copy(oldPosition);
    textMesh.rotation.copy(oldRotation);
    textMesh.scale.copy(oldScale);
    
    // Add back to scene
    scene.add(textMesh);
    
    // Update the material for all copies and letter meshes
    if (animationParams.multiTextEnabled) {
        updateMultiTextCopies();
    }
}

export function updateSceneBackground() {
    scene.background.set(sceneParams.backgroundColor);
}

export function getTextMesh() {
    return textMesh;
}

function animate() {
    requestAnimationFrame(animate);

    // Update shader materials (tessellation/wireframe)
    if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
        // Update main text mesh
        if (textMesh) {
            updateMaterialUniforms(textMesh);
        }
        
        // Update copies if they exist
        if (animationParams.multiTextEnabled && animationParams.copies) {
            animationParams.copies.forEach(copy => {
                if (copy && copy.mesh) {
                    updateMaterialUniforms(copy.mesh);
                }
            });
        }
        
        // Update letter meshes if they exist
        const letterMeshes = getLetterMeshes();
        if (letterMeshes && letterMeshes.length > 0) {
            letterMeshes.forEach(mesh => {
                updateMaterialUniforms(mesh);
            });
        }
    }
    
    // Update particle animations
    if (materialParams.particlesEnabled && materialParams.manipulationAnimationEnabled) {
        const currentTime = Date.now() * 0.001;
        if (textMesh && textMesh.isInstancedMesh) {
            updateParticleAnimation(textMesh, currentTime);
        }
        if (animationParams.multiTextEnabled && animationParams.copies) {
            animationParams.copies.forEach(copy => {
                if (copy && copy.mesh && copy.mesh.isInstancedMesh) {
                    updateParticleAnimation(copy.mesh, currentTime);
                }
            });
        }
    }

    // Update other animations
    updateAnimation();
    
    // Update controls and render
    controls.update();
    renderer.render(scene, camera);
}