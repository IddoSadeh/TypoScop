// three.setup.js
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';
import { projectionParams } from '../parameters/projectionParams.js';
import { initProjectionManager, project } from './projectionManager.js';
import { createMaterial, updateMaterialUniforms, updateParticleAnimation } from './materialManager.js';
import { initAnimationManager, updateAnimation, updateMultiTextCopies, getLetterMeshes, cleanupLetterMeshes } from './animationManager.js';
import fontManager from './fontManager.js';

let scene, camera, renderer, textMesh, controls;
let centerOffset = 0; // Store centerOffset for position calculations

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

    // Initialize managers
    initProjectionManager(scene, renderer, camera);

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
    initAnimationManager(scene, textMesh, renderer, camera);

    // Window resize handler
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    return {
        scene,
        camera,
        renderer,
        textMesh
    };
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
    // Process text and get the appropriate font
    const { text, font: selectedFont, isHebrew } = fontManager.processText(textParams.text, textParams.font);
    textParams.font = selectedFont;

    fontManager.loadFont(selectedFont, isHebrew)
        .then((font) => {
            try {
                let geometry;

                // Create letter-by-letter geometry if letterSpacing is defined
                if (typeof textParams.letterSpacing === 'number' && textParams.letterSpacing !== 0) {
                    const letterGeometries = [];
                    let offsetX = 0;
                    
                    for (const char of text) {
                        if (char === ' ') {
                            offsetX += textParams.size * 0.5 + textParams.letterSpacing;
                            continue;
                        }
                        
                        const letterGeom = new TextGeometry(char, {
                            font: font,
                            size: textParams.size,
                            height: textParams.height,
                            curveSegments: textParams.curveSegments,
                            bevelEnabled: textParams.bevelEnabled,
                            bevelThickness: textParams.bevelThickness,
                            bevelSize: textParams.bevelSize,
                            bevelSegments: textParams.bevelSegments
                        });
                        
                        letterGeom.computeBoundingBox();
                        letterGeom.translate(offsetX, 0, 0);
                        letterGeometries.push(letterGeom);

                        const bbox = letterGeom.boundingBox;
                        const letterWidth = bbox ? (bbox.max.x - bbox.min.x) : 0;
                        offsetX += letterWidth + textParams.letterSpacing;
                    }
                    geometry = mergeGeometries(letterGeometries);
                } else {
                    // Create standard text geometry
                    geometry = new TextGeometry(text, {
                        font: font,
                        size: textParams.size,
                        height: textParams.height,
                        curveSegments: textParams.curveSegments,
                        bevelEnabled: textParams.bevelEnabled,
                        bevelThickness: textParams.bevelThickness,
                        bevelSize: textParams.bevelSize,
                        bevelSegments: textParams.bevelSegments
                    });
                }

                // Center the geometry
                geometry.computeBoundingBox();
                const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                
                // Store old transform
                const oldPosition = textMesh ? textMesh.position.clone() : new THREE.Vector3();
                const oldRotation = textMesh ? textMesh.rotation.clone() : new THREE.Euler();

                // Clean up old mesh
                if (textMesh) {
                    scene.remove(textMesh);
                    if (textMesh.geometry) textMesh.geometry.dispose();
                    if (textMesh.material) textMesh.material.dispose();
                }

                // Create new material/mesh
                const materialObject = createMaterial(geometry);
                if (materialObject.mesh) {
                    textMesh = materialObject.mesh;
                } else {
                    textMesh = new THREE.Mesh(materialObject.geometry, materialObject.material);
                }

                // Apply transform with scene position
                textMesh.position.copy(oldPosition);
                textMesh.position.x = centerOffset + sceneParams.position.x;
                textMesh.position.y = sceneParams.position.y;
                textMesh.rotation.copy(oldRotation);

                // Handle projection
                if (projectionParams.enabled) {
                    textMesh = project(textMesh);
                } else {
                    scene.add(textMesh);
                }

                camera.lookAt(textMesh.position);

                // Initialize managers
                initAnimationManager(scene, textMesh, renderer, camera);

                // Update additional features
                if (animationParams.multiTextEnabled) {
                    updateMultiTextCopies();
                }
                if (animationParams.scrambleEnabled) {
                    cleanupLetterMeshes();
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
    
    // Store transform
    const oldPosition = textMesh.position.clone();
    const oldRotation = textMesh.rotation.clone();
    const oldScale = textMesh.scale.clone();
    
    // Clean up old mesh
    scene.remove(textMesh);
    textMesh.geometry.dispose();
    textMesh.material.dispose();
    
    // Create new mesh
    if (materialObject.mesh) {
        textMesh = materialObject.mesh;
    } else {
        textMesh = new THREE.Mesh(materialObject.geometry, materialObject.material);
    }
    
    // Restore transform
    textMesh.position.copy(oldPosition);
    textMesh.rotation.copy(oldRotation);
    textMesh.scale.copy(oldScale);
    
    // Handle projection
    if (projectionParams.enabled) {
        textMesh = project(textMesh);
    } else {
        scene.add(textMesh);
    }
    
    // Update copies and letters
    if (animationParams.multiTextEnabled) {
        updateMultiTextCopies();
    }
    if (animationParams.scrambleEnabled) {
        cleanupLetterMeshes();
    }
}


export function updateScenePosition() {
    if (!textMesh) return;
    
    // Update main text mesh position
    textMesh.position.x = centerOffset + sceneParams.position.x;
    textMesh.position.y = sceneParams.position.y;
    
    // Update positions for multiple copies
    if (animationParams.multiTextEnabled && animationParams.copies) {
        animationParams.copies.forEach(copy => {
            if (copy && copy.mesh) {
                copy.mesh.position.x = copy.basePosition.x + sceneParams.position.x;
                copy.mesh.position.y = copy.basePosition.y + sceneParams.position.y;
            }
        });
    }
    
    // Update letter positions if scramble is enabled
    const letterMeshes = getLetterMeshes();
    if (letterMeshes.length > 0) {
        letterMeshes.forEach(mesh => {
            mesh.position.x = mesh.userData.originalX + sceneParams.position.x;
            mesh.position.y = mesh.userData.originalY + sceneParams.position.y;
        });
    }
}

export function updateSceneBackground() {
    scene.background.set(sceneParams.backgroundColor);
}

export function updateSceneLighting() {
    const lights = scene.children.filter(child => child.isLight);
    
    // Update ambient light
    const ambientLight = lights.find(light => light.isAmbientLight);
    if (ambientLight) {
        ambientLight.intensity = sceneParams.ambientLightIntensity;
    }
    
    // Update main light (first directional light)
    const mainLight = lights.find(light => light.isDirectionalLight);
    if (mainLight) {
        mainLight.intensity = sceneParams.mainLightIntensity;
    }
    
    // Update fill light (second directional light)
    const fillLight = lights.filter(light => light.isDirectionalLight)[1];
    if (fillLight) {
        fillLight.intensity = sceneParams.fillLightIntensity;
    }
}

export function updateSceneCamera() {
    if (!camera) return;
    
    // Update field of view
    camera.fov = sceneParams.fieldOfView;
    
    // Update camera distance (z position)
    camera.position.z = sceneParams.cameraDistance;
    
    // Update fog if enabled
    if (sceneParams.fogEnabled) {
        scene.fog = new THREE.Fog(
            sceneParams.fogColor,
            sceneParams.cameraDistance * 0.5, // Near
            sceneParams.cameraDistance * 2    // Far
        );
    } else {
        scene.fog = null;
    }
    
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);

    // Update shader materials
    if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
        if (textMesh) {
            updateMaterialUniforms(textMesh);
        }
        
        if (animationParams.multiTextEnabled && animationParams.copies) {
            animationParams.copies.forEach(copy => {
                if (copy && copy.mesh) {
                    updateMaterialUniforms(copy.mesh);
                }
            });
        }
        
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

    // Update animations
    updateAnimation();
    
    // Update controls and render
    controls.update();
    renderer.render(scene, camera);
}

export function getTextMesh() {
    return textMesh;
}