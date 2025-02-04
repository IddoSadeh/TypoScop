// animationManager.js
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { animationParams } from '../parameters/animationParams.js';
import { textParams } from '../parameters/textParams.js';
import fontManager from './fontManager.js';
import { createMaterial } from './materialManager.js';


let letterMeshes = [];
let scene;
let mainTextMesh;
let rendererRef = null;
let cameraRef = null;
let backupTextMesh = null;

/*──────────────────────────────────────────────────────────────
  INITIALIZATION
──────────────────────────────────────────────────────────────*/
export function initAnimationManager(threeScene, textMesh, renderer, camera) {
  scene = threeScene;
  mainTextMesh = textMesh;
  rendererRef = renderer;
  cameraRef = camera;
}

function getRandomPosition(spread) {
    return {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * (spread * 0.5)
    };
}

/*──────────────────────────────────────────────────────────────
  MULTI-TEXT COPIES MANAGEMENT
──────────────────────────────────────────────────────────────*/

export function updateMultiTextCopies() {
    // If multi-copy mode is off, clean up extra copies.
    if (!animationParams.multiTextEnabled) {
        if (animationParams.copies) {
            animationParams.copies.forEach(copy => {
                if (copy && copy.mesh && copy.mesh !== mainTextMesh) {
                    scene.remove(copy.mesh);
                    if (copy.mesh.geometry) copy.mesh.geometry.dispose();
                    if (copy.mesh.material) copy.mesh.material.dispose();
                }
            });
            letterMeshes = letterMeshes.filter(mesh => {
                if (!mesh.userData.copyRef || mesh.userData.copyRef.mesh === mainTextMesh) {
                    return true;
                }
                scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                return false;
            });
        }
        animationParams.copies = [{
            mesh: mainTextMesh,
            basePosition: mainTextMesh.position.clone(),
            rotationOffset: new THREE.Vector3(0, 0, 0)
        }];
        return;
    }
    
    // Multi-copy enabled – remove any existing copies (except the main one)
    if (animationParams.copies) {
        animationParams.copies.forEach(copy => {
            if (copy && copy.mesh && copy.mesh !== mainTextMesh) {
                scene.remove(copy.mesh);
                if (copy.mesh.geometry) copy.mesh.geometry.dispose();
                if (copy.mesh.material) copy.mesh.material.dispose();
            }
        });
    }
    if (!mainTextMesh) return;
    
    // Create new copies and store their base positions/rotation offsets.
    animationParams.copies = [];
    const originalRotation = mainTextMesh.rotation.clone();
    const originalScale = mainTextMesh.scale.clone();
    
    for (let i = 0; i < animationParams.copyCount; i++) {
        const position = getRandomPosition(animationParams.spread);
        if (i === 0) {
            // For the first copy, reposition the main text mesh.
            mainTextMesh.position.set(position.x, position.y, position.z);
            mainTextMesh.rotation.copy(originalRotation);
            mainTextMesh.scale.copy(originalScale);
            animationParams.copies.push({
                mesh: mainTextMesh,
                basePosition: new THREE.Vector3(position.x, position.y, position.z),
                rotationOffset: new THREE.Vector3(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                )
            });
            continue;
        }
        
        let copyMesh;
        if (mainTextMesh.isInstancedMesh) {
            copyMesh = mainTextMesh.clone();
            if (mainTextMesh.userData.originalPositions) {
                copyMesh.userData.originalPositions = mainTextMesh.userData.originalPositions.slice();
            }
        } else {
            const copyMaterial = mainTextMesh.material.clone();
            copyMesh = new THREE.Mesh(mainTextMesh.geometry, copyMaterial);
        }
        copyMesh.position.set(position.x, position.y, position.z);
        copyMesh.rotation.copy(originalRotation);
        copyMesh.scale.copy(originalScale);
        scene.add(copyMesh);
        
        animationParams.copies.push({
            mesh: copyMesh,
            basePosition: new THREE.Vector3(position.x, position.y, position.z),
            rotationOffset: new THREE.Vector3(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            )
        });
    }
    
    // ── Material Update for Scrambled Letters ──
    // Instead of cleaning up and re-creating scrambled letters,
    // update the material on existing letter meshes if scramble is enabled.
    if (animationParams.scrambleEnabled) {
        if (letterMeshes.length > 0) {
            letterMeshes.forEach(mesh => {
                // Re-create a material using the letter's geometry.
                const newMatObj = createMaterial(mesh.geometry.clone());
                if (newMatObj.mesh) {
                    mesh.material.dispose();
                    mesh.material = newMatObj.mesh.material;
                } else {
                    mesh.material.dispose();
                    mesh.material = newMatObj.material;
                }
            });
        } else {
            // If no letter meshes exist yet, create them.
            updateScrambleAnimation();
        }
    }
}

/*──────────────────────────────────────────────────────────────
  LETTER SCRAMBLE ANIMATION
──────────────────────────────────────────────────────────────*/

function updateScrambleAnimation() {
    if (!animationParams.scrambleEnabled) return;

    // If the expected letter count (for multi-text copies) doesn't match,
    // then clear existing scrambled letters.
    if (animationParams.multiTextEnabled && animationParams.copies) {
        const expectedCount = animationParams.copies.length * textParams.text.length;
        if (letterMeshes.length !== expectedCount) {
            cleanupLetterMeshes();
        }
    }

    // If no scrambled letters exist, create them.
    if (letterMeshes.length === 0) {
        letterMeshes = [];
        
        if (animationParams.multiTextEnabled && animationParams.copies) {
            animationParams.copies.forEach(copy => {
                if (!copy.mesh) return;
                const textContent = textParams.text;
                const letterSpacing = textParams.letterSpacing;
                
                // Hide the copy's main mesh.
                copy.mesh.visible = false;
                const totalWidth = textContent.length * letterSpacing;
                let startX = -totalWidth / 2 + copy.basePosition.x;
                
                textContent.split('').forEach((letter, index) => {
                    const geometry = new TextGeometry(letter, {
                        font: fontManager.getFont(textParams.font),
                        size: textParams.size,
                        height: textParams.height,
                        curveSegments: textParams.curveSegments,
                        bevelEnabled: textParams.bevelEnabled,
                        bevelThickness: textParams.bevelThickness,
                        bevelSize: textParams.bevelSize,
                        bevelSegments: textParams.bevelSegments
                    });
                    
                    const materialObject = createMaterial(geometry);
                    let letterMesh;
                    if (materialObject.mesh) {
                        letterMesh = materialObject.mesh.clone();
                        if (materialObject.mesh.userData.originalPositions) {
                            letterMesh.userData.originalPositions = materialObject.mesh.userData.originalPositions.slice();
                        }
                    } else {
                        letterMesh = new THREE.Mesh(materialObject.geometry, materialObject.material);
                    }
                    
                    letterMesh.position.set(
                        startX + (index * letterSpacing),
                        copy.basePosition.y,
                        copy.basePosition.z
                    );
                    letterMesh.userData.originalX = letterMesh.position.x;
                    letterMesh.userData.originalY = letterMesh.position.y;
                    letterMesh.userData.originalZ = letterMesh.position.z;
                    letterMesh.userData.copyRef = copy;
                    scene.add(letterMesh);
                    letterMeshes.push(letterMesh);
                });
            });
        } else if (mainTextMesh) {
            const textContent = textParams.text;
            const letterSpacing = textParams.size * 0.6;
            mainTextMesh.visible = false;
            const totalWidth = textContent.length * letterSpacing;
            let startX = -totalWidth / 2;
            
            textContent.split('').forEach((letter, index) => {
                const geometry = new TextGeometry(letter, {
                    font: fontManager.getFont(textParams.font),
                    size: textParams.size,
                    height: textParams.height,
                    curveSegments: textParams.curveSegments,
                    bevelEnabled: textParams.bevelEnabled,
                    bevelThickness: textParams.bevelThickness,
                    bevelSize: textParams.bevelSize,
                    bevelSegments: textParams.bevelSegments
                });
                
                const materialObject = createMaterial(geometry);
                let letterMesh;
                if (materialObject.mesh) {
                    letterMesh = materialObject.mesh.clone();
                    if (materialObject.mesh.userData.originalPositions) {
                        letterMesh.userData.originalPositions = materialObject.mesh.userData.originalPositions.slice();
                    }
                } else {
                    letterMesh = new THREE.Mesh(materialObject.geometry, materialObject.material);
                }
                
                letterMesh.position.set(
                    startX + (index * letterSpacing),
                    0,
                    0
                );
                letterMesh.userData.originalX = letterMesh.position.x;
                letterMesh.userData.originalY = letterMesh.position.y;
                letterMesh.userData.originalZ = letterMesh.position.z;
                scene.add(letterMesh);
                letterMeshes.push(letterMesh);
            });
        }
    }
    
    // Update scramble animation for each letter.
    const intensity = animationParams.scrambleIntensity || 1;
    const speed = animationParams.scrambleSpeed || 0.5;
    
    letterMeshes.forEach((mesh, index) => {
        switch (animationParams.scrambleMode) {
            case 'random':
                mesh.position.x = mesh.userData.originalX + (Math.sin(Date.now() * speed * 0.001 + index) * intensity * textParams.size);
                mesh.position.y = mesh.userData.originalY + (Math.cos(Date.now() * speed * 0.001 + index) * intensity * textParams.size);
                mesh.position.z = mesh.userData.originalZ + (Math.sin(Date.now() * speed * 0.001 + index * 2) * intensity * textParams.size * 0.5);
                break;
            case 'swap':
                const wordLength = textParams.text.length;
                const copyIndex = Math.floor(index / wordLength);
                const letterIndex = index % wordLength;
                const swapPartner = copyIndex * wordLength + (letterIndex % 2 === 0 ? 
                    Math.min(letterIndex + 1, wordLength - 1) : 
                    letterIndex - 1);
                if (swapPartner < letterMeshes.length) {
                    const t = (Math.sin(Date.now() * speed * 0.001) + 1) / 2;
                    mesh.position.x = THREE.MathUtils.lerp(
                        mesh.userData.originalX,
                        letterMeshes[swapPartner].userData.originalX,
                        t
                    );
                }
                break;
            case 'circular':
                const angle = Date.now() * speed * 0.001 + (index * (Math.PI * 2) / textParams.text.length);
                mesh.position.x = mesh.userData.originalX + Math.cos(angle) * intensity * textParams.size;
                mesh.position.y = mesh.userData.originalY + Math.sin(angle) * intensity * textParams.size;
                break;
        }
    });
}

export function cleanupLetterMeshes() {
    letterMeshes.forEach(mesh => {
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
    });
    letterMeshes = [];
    if (animationParams.multiTextEnabled) {
        animationParams.copies.forEach(copy => {
            if (copy.mesh) copy.mesh.visible = true;
        });
    } else if (mainTextMesh) {
        mainTextMesh.visible = true;
    }
}

/*──────────────────────────────────────────────────────────────
  OTHER ANIMATIONS (ROTATION, SCALE, ETC.)
──────────────────────────────────────────────────────────────*/

export function updateAnimation() {
    if (!mainTextMesh && letterMeshes.length === 0) return;
    
    // If scramble is off and letter meshes exist, clean them up.
    if (letterMeshes.length > 0 && !animationParams.scrambleEnabled) {
        cleanupLetterMeshes();
    } else if (animationParams.scrambleEnabled) {
        updateScrambleAnimation();
    }

    // Update rotation/scale on each mesh.
    if (letterMeshes.length > 0) {
        letterMeshes.forEach(mesh => {
            updateMeshAnimations(mesh);
        });
    } else if (animationParams.multiTextEnabled) {
        animationParams.copies.forEach((copy, index) => {
            if (!copy.mesh) return;
            updateMeshAnimations(copy.mesh, copy.rotationOffset, index);
        });
    } else {
        updateMeshAnimations(mainTextMesh);
    }

    updateScaleAnimation();
}

function updateMeshAnimations(mesh, rotationOffset = null, index = 0) {
    if (!mesh) return;
    if (animationParams.rotateXEnabled) {
        const rotationAmount = animationParams.rotateX;
        mesh.rotation.x += rotationOffset && animationParams.rotateIndependently ?
            rotationAmount * (1 + rotationOffset.x) : rotationAmount;
    }
    if (animationParams.rotateYEnabled) {
        const rotationAmount = animationParams.rotateY;
        mesh.rotation.y += rotationOffset && animationParams.rotateIndependently ?
            rotationAmount * (1 + rotationOffset.y) : rotationAmount;
    }
    if (animationParams.rotateZEnabled) {
        const rotationAmount = animationParams.rotateZ;
        mesh.rotation.z += rotationOffset && animationParams.rotateIndependently ?
            rotationAmount * (1 + rotationOffset.z) : rotationAmount;
    }
    if (animationParams.scaleEnabled) {
        if (rotationOffset && animationParams.rotateIndependently) {
            const scaleOffset = Math.sin(Date.now() * 0.003 + index * 0.5) * 0.2;
            const scale = animationParams.currentScale + scaleOffset;
            mesh.scale.set(scale, scale, scale);
        } else {
            mesh.scale.set(animationParams.currentScale, animationParams.currentScale, animationParams.currentScale);
        }
    }
}

function updateScaleAnimation() {
    if (!animationParams.scaleEnabled) return;
    animationParams.currentScale += animationParams.scaleSpeed * animationParams.scaleDirection;
    if (animationParams.currentScale >= animationParams.scaleMax) {
        animationParams.scaleDirection = -1;
        animationParams.currentScale = animationParams.scaleMax;
    } else if (animationParams.currentScale <= animationParams.scaleMin) {
        animationParams.scaleDirection = 1;
        animationParams.currentScale = animationParams.scaleMin;
    }
}

/*──────────────────────────────────────────────────────────────
  EXPORT HELPER
──────────────────────────────────────────────────────────────*/

export function getLetterMeshes() {
    return letterMeshes;
}


  // Helper function to properly dispose of a mesh and its resources
function disposeMesh(mesh) {
    if (!mesh) return;
    
    // Remove from scene
    scene.remove(mesh);
    
    // Dispose of geometry
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    
    // Dispose of material(s)
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => material.dispose());
    } else if (mesh.material) {
      // Handle special case of shader materials
      if (mesh.material.type === 'ShaderMaterial') {
        Object.values(mesh.material.uniforms).forEach(uniform => {
          if (uniform.value instanceof THREE.Texture) {
            uniform.value.dispose();
          }
        });
      }
      mesh.material.dispose();
    }
  }
  
  function cleanupAllMeshes() {
    // Clean up letter meshes
    letterMeshes.forEach(disposeMesh);
    letterMeshes = [];
  
    // Clean up multi-text copies
    if (animationParams.copies) {
      animationParams.copies.forEach(copy => {
        if (copy && copy.mesh && copy.mesh !== mainTextMesh) {
          disposeMesh(copy.mesh);
        }
      });
      animationParams.copies = [];
    }
  }
  
  export function projectTextMesh() {
    if (!rendererRef || !cameraRef) {
      console.error('Renderer or camera not set in animationManager.');
      return;
    }
  
    // Handle disabling projection
    if (!animationParams.projectionEnabled) {
      if (backupTextMesh) {
        disposeMesh(mainTextMesh);
        mainTextMesh = backupTextMesh;
        backupTextMesh = null;
        scene.add(mainTextMesh);
        initAnimationManager(scene, mainTextMesh, rendererRef, cameraRef);
      }
      return;
    }
  
    // Store backup if not already stored
    if (!backupTextMesh) {
      backupTextMesh = mainTextMesh;
    }
  
    // Create render target
    const size = new THREE.Vector2();
    rendererRef.getSize(size);
    const factor = 2;
    const renderTarget = new THREE.WebGLRenderTarget(size.x * factor, size.y * factor);
  
    // Render to target
    rendererRef.setRenderTarget(renderTarget);
    rendererRef.render(scene, cameraRef);
    rendererRef.setRenderTarget(null);
  
    // Clean up all existing meshes
    cleanupAllMeshes();
  
    // Create new projected mesh based on mode...
    let newGeometry, newMaterial;
    
   
    switch (animationParams.projectionMode) {
        case 'torusknot':
          newGeometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
          newMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
          break;
        case 'cube':
          newGeometry = new THREE.BoxGeometry(10, 10, 10);
          newMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
          break;
        case 'sphere':
          newGeometry = new THREE.SphereGeometry(7, 32, 32);
          newMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
          break;
        case 'twisted':
          newGeometry = new THREE.TorusKnotGeometry(10, 2.5, 150, 20);
          newMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
          break;
        case 'artistic': {
          // Create a custom parametric geometry.
          // This function creates a twisted, undulating surface.
          newGeometry = new THREE.ParametricBufferGeometry(function(u, v, target) {
            // u, v in [0,1]
            const U = u * Math.PI * 2;       // full circle
            const V = (v - 0.5) * 10;         // height from -5 to +5
            // Base radius oscillates with v.
            const baseRadius = 8 + 2 * Math.sin(v * Math.PI * 4);
            // Add a twist: vary the angle based on v.
            const twist = 0.5 * Math.sin(u * Math.PI * 4 + v * Math.PI * 2);
            const angle = U + twist;
            const x = baseRadius * Math.cos(angle);
            const y = baseRadius * Math.sin(angle);
            const z = V + 2 * Math.cos(u * Math.PI * 6);
            target.set(x, y, z);
          }, 200, 50);
          
          // Create a custom shader material.
          newMaterial = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uTexture: { value: renderTarget.texture }
            },
            vertexShader: `
              uniform float uTime;
              varying vec2 vUv;
              void main() {
                vUv = uv;
                vec3 pos = position;
                // Apply an additional time-based distortion.
                pos.z += sin(uv.x * 10.0 + uTime * 2.0) * 1.0;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `,
            fragmentShader: `
              uniform sampler2D uTexture;
              varying vec2 vUv;
              void main() {
                vec4 color = texture2D(uTexture, vUv);
                gl_FragColor = color;
              }`
            ,
            side: THREE.DoubleSide,
            transparent: true
          });
          break;
        }
        default:
          console.warn('Unknown projection mode:', animationParams.projectionMode);
          return;
      }
      
      // Apply projectionScale to new geometry.
      newGeometry.scale(animationParams.projectionScale, animationParams.projectionScale, animationParams.projectionScale);
      
  
    // Create and add new mesh
    const projectedMesh = new THREE.Mesh(newGeometry, newMaterial);
    if (backupTextMesh) {
      projectedMesh.position.copy(backupTextMesh.position);
      projectedMesh.rotation.copy(backupTextMesh.rotation);
      projectedMesh.scale.copy(backupTextMesh.scale);
    }
  
    scene.add(projectedMesh);
    mainTextMesh = projectedMesh;
  
    // Store render target reference for cleanup
    mainTextMesh.userData.renderTarget = renderTarget;
  
    initAnimationManager(scene, mainTextMesh, rendererRef, cameraRef);
  }