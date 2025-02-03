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

/*──────────────────────────────────────────────────────────────
  INITIALIZATION & HELPER FUNCTIONS
──────────────────────────────────────────────────────────────*/

export function initAnimationManager(threeScene, textMesh) {
    scene = threeScene;
    mainTextMesh = textMesh;
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
