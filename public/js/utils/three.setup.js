import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.152.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.152.0/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.0/examples/jsm/controls/OrbitControls.js';

import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';

let scene, camera, renderer, textMesh, controls;
let letterMeshes = []; 

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
    createText();
    animate();

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

// Font mapping object
const FONTS = {
    latin: {
        helvetiker: 'https://unpkg.com/three@0.152.0/examples/fonts/helvetiker_regular.typeface.json',
        optimer: 'https://unpkg.com/three@0.152.0/examples/fonts/optimer_regular.typeface.json',
        gentilis: 'https://unpkg.com/three@0.152.0/examples/fonts/gentilis_regular.typeface.json'
    },
    hebrew: {
        haim: '/fonts/Haim Classic v2 FM_Regular.json',
        // Add more Hebrew fonts here:
        // david: '/fonts/David_Regular.json',
        // frank: '/fonts/Frank_Regular.json',
    }
};

// Cache for loaded fonts
const fontCache = new Map();

function isRTL(text) {
    return /[\u0590-\u05FF]/.test(text);
}


// Font loader promise wrapper
function loadFont(fontName, isHebrew = false) {
    // Check if font is already cached
    if (fontCache.has(fontName)) {
        return Promise.resolve(fontCache.get(fontName));
    }

    const loader = new FontLoader();
    let fontUrl;

    if (isHebrew) {
        fontUrl = FONTS.hebrew[fontName] || FONTS.hebrew.haim; // Default Hebrew font
    } else {
        fontUrl = FONTS.latin[fontName] || FONTS.latin.helvetiker; // Default Latin font
    }

    return new Promise((resolve, reject) => {
        loader.load(
            fontUrl,
            (font) => {
                fontCache.set(fontName, font);
                resolve(font);
            },
            undefined,
            (error) => reject(error)
        );
    });
}

function getFontType(fontName) {
    if (FONTS.hebrew[fontName]) return 'hebrew';
    if (FONTS.latin[fontName]) return 'latin';
    return null;
}

function updateFontDropdown(fontName) {
    const fontSelect = document.getElementById('ai-font-name'); // Match the ID from chatInterface.js
    if (fontSelect && fontSelect.value !== fontName) {
        fontSelect.value = fontName;
    }
}



export function createText() {
    let text = textParams.text;
    const containsHebrew = isRTL(text);
    
    const currentFontType = getFontType(textParams.font?.toLowerCase());
    
    // Determine which font to use
    let selectedFont;
    if (containsHebrew && currentFontType !== 'hebrew') {
        selectedFont = 'haim';
        textParams.font = 'haim';
        updateFontDropdown('haim');
    } else {
        selectedFont = textParams.font?.toLowerCase() || 'helvetiker';
    }
    
    // Reverse text if Hebrew
    if (containsHebrew) {
        text = text.split('').reverse().join('');
    }
    
    // Clean up existing copies before loading new text
    if (animationParams.multiTextEnabled) {
        animationParams.copies.forEach(copy => {
            if (copy.mesh && copy.mesh !== textMesh) {
                scene.remove(copy.mesh);
                if (copy.mesh.geometry) copy.mesh.geometry.dispose();
                if (copy.mesh.material) copy.mesh.material.dispose();
            }
        });
        animationParams.copies = [];
    }

    loadFont(selectedFont, containsHebrew)
        .then((font) => {
            try {
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

                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(materialParams.color),
                    metalness: materialParams.metalness,
                    roughness: materialParams.roughness
                });

                if (textMesh) {
                    scene.remove(textMesh);
                    geometry.dispose();
                    textMesh.material.dispose();
                }

                textMesh = new THREE.Mesh(geometry, material);
                
                // Center the text
                geometry.computeBoundingBox();
                const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
                textMesh.position.x = centerOffset;

                scene.add(textMesh);
                camera.lookAt(textMesh.position);

                // After creating the main text mesh, create copies if enabled
                if (animationParams.multiTextEnabled) {
                    updateMultiTextCopies();
                }

            } catch (error) {
                console.error('Error creating text geometry:', error);
            }
        })
        .catch(error => {
            console.error('Error loading font:', error);
        });
}

function createTextCopy(originalMesh) {
    if (!originalMesh) return null;
    
    const newMesh = originalMesh.clone();
    
    // Generate random position within spread range
    const position = {
        x: (Math.random() - 0.5) * animationParams.spread,
        y: (Math.random() - 0.5) * animationParams.spread,
        z: (Math.random() - 0.5) * animationParams.spread * 0.5 // Less spread in Z
    };
    
    newMesh.position.set(position.x, position.y, position.z);
    
    return {
        mesh: newMesh,
        rotation: { x: 0, y: 0, z: 0 },
        position: position
    };
}

export function updateMultiTextCopies() {
    // Clean up existing copies
    animationParams.copies.forEach(copy => {
        if (copy.mesh && copy.mesh !== textMesh) { // Don't remove original
            scene.remove(copy.mesh);
            if (copy.mesh.geometry) copy.mesh.geometry.dispose();
            if (copy.mesh.material) copy.mesh.material.dispose();
        }
    });
    animationParams.copies = [];

    if (!animationParams.multiTextEnabled || !textMesh) return;

    // Keep original as first copy
    animationParams.copies.push({
        mesh: textMesh,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: textMesh.position.x, y: textMesh.position.y, z: textMesh.position.z }
    });

    // Create new copies
    for (let i = 1; i < animationParams.copyCount; i++) {
        const copy = createTextCopy(textMesh);
        if (copy) {
            scene.add(copy.mesh);
            animationParams.copies.push(copy);
        }
    }
}

export function getTextMesh() {
    return textMesh;
}

// Replace the existing updateMultiTextAnimation function with this version
function updateMultiTextAnimation() {
    if (!animationParams.multiTextEnabled) return;

    animationParams.copies.forEach((copy, index) => {
        if (!copy.mesh) return;

        // Apply rotations based on settings
        if (animationParams.rotateXEnabled) {
            const speed = animationParams.rotateIndependently ? 
                animationParams.rotateX * (1 + index * 0.5) : // Increased multiplier
                animationParams.rotateX;
            copy.rotation.x += speed;
            copy.mesh.rotation.x = copy.rotation.x;
        }

        if (animationParams.rotateYEnabled) {
            const speed = animationParams.rotateIndependently ? 
                animationParams.rotateY * (1 + index * 0.5) : 
                animationParams.rotateY;
            copy.rotation.y += speed;
            copy.mesh.rotation.y = copy.rotation.y;
        }

        if (animationParams.rotateZEnabled) {
            const speed = animationParams.rotateIndependently ? 
                animationParams.rotateZ * (1 + index * 0.5) : 
                animationParams.rotateZ;
            copy.rotation.z += speed;
            copy.mesh.rotation.z = copy.rotation.z;
        }

        // Add unique movement patterns for independent rotation
        if (animationParams.rotateIndependently) {
            const time = Date.now() * 0.001;
            copy.mesh.rotation.x += Math.sin(time + index * 0.5) * 0.02;
            copy.mesh.rotation.y += Math.cos(time + index * 0.5) * 0.02;
            copy.mesh.rotation.z += Math.sin(time * 2 + index * 0.5) * 0.02;
        }
    });
}

export function updateMaterial() {
    if (textMesh && textMesh.material) {
        textMesh.material.color.set(materialParams.color);
        textMesh.material.metalness = materialParams.metalness;
        textMesh.material.roughness = materialParams.roughness;
    }
}

export function updateSceneBackground() {
    scene.background.set(sceneParams.backgroundColor);
}

function updateScrambleAnimation() {
    if (!textMesh || !animationParams.scrambleEnabled) return;
    
    // Initialize letter meshes when scramble is first enabled
    if (letterMeshes.length === 0 && textMesh) {
        const textContent = textParams.text;
        const material = textMesh.material.clone();
        const letterSpacing = textParams.size * 0.6; // Adjust spacing between letters
        
        // Remove the single mesh
        scene.remove(textMesh);

        // Calculate total width for centering
        const totalWidth = textContent.length * letterSpacing;
        let startX = -totalWidth / 2;

        // Create individual letter meshes
        textContent.split('').forEach((letter, index) => {
            const geometry = new TextGeometry(letter, {
                font: fontCache.get(textParams.font),
                size: textParams.size,
                height: textParams.height,
                curveSegments: textParams.curveSegments,
                bevelEnabled: textParams.bevelEnabled,
                bevelThickness: textParams.bevelThickness,
                bevelSize: textParams.bevelSize,
                bevelSegments: textParams.bevelSegments
            });

            const letterMesh = new THREE.Mesh(geometry, material);
            
            // Set initial position
            letterMesh.position.set(
                startX + (index * letterSpacing),
                0,
                0
            );
            
            // Store original position
            letterMesh.userData.originalX = letterMesh.position.x;
            letterMesh.userData.originalY = letterMesh.position.y;
            letterMesh.userData.originalZ = letterMesh.position.z;
            
            scene.add(letterMesh);
            letterMeshes.push(letterMesh);
        });
    }

    // Animate existing letter meshes
    const intensity = animationParams.scrambleIntensity || 1;
    const speed = animationParams.scrambleSpeed || 0.5;
    
    letterMeshes.forEach((mesh, index) => {
        switch(animationParams.scrambleMode) {
            case 'random':
                // Random movement around original position
                mesh.position.x = mesh.userData.originalX + (Math.sin(Date.now() * speed * 0.001 + index) * intensity * textParams.size);
                mesh.position.y = mesh.userData.originalY + (Math.cos(Date.now() * speed * 0.001 + index) * intensity * textParams.size);
                mesh.position.z = mesh.userData.originalZ + (Math.sin(Date.now() * speed * 0.001 + index * 2) * intensity * textParams.size * 0.5);
                break;
                
            case 'swap':
                // Swap positions between pairs
                const swapPartner = index % 2 === 0 ? index + 1 : index - 1;
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
                // Circular motion around original position
                const angle = Date.now() * speed * 0.001 + (index * (Math.PI * 2) / letterMeshes.length);
                mesh.position.x = mesh.userData.originalX + Math.cos(angle) * intensity * textParams.size;
                mesh.position.y = mesh.userData.originalY + Math.sin(angle) * intensity * textParams.size;
                break;
        }
    });
}

function updateAnimation() {
    if (!textMesh && letterMeshes.length === 0) return;
    
    if (animationParams.multiTextEnabled) {
        // Handle multi-text animations
        updateMultiTextAnimation();
        
        // Apply scale animation to all copies
        if (animationParams.scaleEnabled) {
            animationParams.currentScale += animationParams.scaleSpeed * animationParams.scaleDirection;
            
            if (animationParams.currentScale >= animationParams.scaleMax) {
                animationParams.scaleDirection = -1;
                animationParams.currentScale = animationParams.scaleMax;
            } else if (animationParams.currentScale <= animationParams.scaleMin) {
                animationParams.scaleDirection = 1;
                animationParams.currentScale = animationParams.scaleMin;
            }
            
            animationParams.copies.forEach(copy => {
                if (copy.mesh) {
                    copy.mesh.scale.set(
                        animationParams.currentScale,
                        animationParams.currentScale,
                        animationParams.currentScale
                    );
                }
            });
        }

        // Apply scramble animation if enabled
        if (animationParams.scrambleEnabled) {
            animationParams.copies.forEach((copy, index) => {
                if (!copy.mesh) return;
                
                const intensity = animationParams.scrambleIntensity || 1;
                const speed = animationParams.scrambleSpeed || 0.5;
                const time = Date.now() * speed * 0.001;
                
                switch(animationParams.scrambleMode) {
                    case 'random':
                        copy.mesh.position.x = copy.position.x + Math.sin(time + index) * intensity * textParams.size;
                        copy.mesh.position.y = copy.position.y + Math.cos(time + index) * intensity * textParams.size;
                        copy.mesh.position.z = copy.position.z + Math.sin(time * 2 + index) * intensity * textParams.size * 0.5;
                        break;
                    case 'swap':
                        const swapPartner = index % 2 === 0 ? index + 1 : index - 1;
                        if (swapPartner < animationParams.copies.length) {
                            const t = (Math.sin(time) + 1) / 2;
                            copy.mesh.position.x = THREE.MathUtils.lerp(
                                copy.position.x,
                                animationParams.copies[swapPartner].position.x,
                                t
                            );
                        }
                        break;
                    case 'circular':
                        const angle = time + (index * (Math.PI * 2) / animationParams.copies.length);
                        copy.mesh.position.x = copy.position.x + Math.cos(angle) * intensity * textParams.size;
                        copy.mesh.position.y = copy.position.y + Math.sin(angle) * intensity * textParams.size;
                        break;
                }
            });
        }
        return;
    }
    // Handle scramble state changes
    if (animationParams.scrambleEnabled && letterMeshes.length === 0) {
        if (textMesh) {
            updateScrambleAnimation();
        }
    } else if (!animationParams.scrambleEnabled && letterMeshes.length > 0) {
        letterMeshes.forEach(mesh => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        letterMeshes = [];
        createText();
        return;
    }

    // Apply animations to either individual letters or single mesh
    const meshesToAnimate = letterMeshes.length > 0 ? letterMeshes : [textMesh];
    
    // Handle rotations
    meshesToAnimate.forEach(mesh => {
        if (animationParams.rotateXEnabled) {
            mesh.rotation.x += animationParams.rotateX;
        }
        if (animationParams.rotateYEnabled) {
            mesh.rotation.y += animationParams.rotateY;
        }
        if (animationParams.rotateZEnabled) {
            mesh.rotation.z += animationParams.rotateZ;
        }
    });

    // Handle scale/pulse animation
    if (animationParams.scaleEnabled) {
        animationParams.currentScale += animationParams.scaleSpeed * animationParams.scaleDirection;
        
        if (animationParams.currentScale >= animationParams.scaleMax) {
            animationParams.scaleDirection = -1;
            animationParams.currentScale = animationParams.scaleMax;
        } else if (animationParams.currentScale <= animationParams.scaleMin) {
            animationParams.scaleDirection = 1;
            animationParams.currentScale = animationParams.scaleMin;
        }
        
        meshesToAnimate.forEach(mesh => {
            mesh.scale.set(
                animationParams.currentScale,
                animationParams.currentScale,
                animationParams.currentScale
            );
        });
    }

    // Handle scramble animation if enabled
    if (animationParams.scrambleEnabled) {
        updateScrambleAnimation();
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateAnimation();  // Add this line
    controls.update();
    renderer.render(scene, camera);
}