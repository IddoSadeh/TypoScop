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
        // Only switch to haim if current font doesn't support Hebrew
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

                console.log('Creating text with font:', selectedFont);
                console.log('Text position:', textMesh.position);
                console.log('Text bounding box:', geometry.boundingBox);
                console.log('Center offset:', centerOffset);
                console.log('Is Hebrew:', containsHebrew);
                console.log('Rendered text:', text);

                scene.add(textMesh);
                camera.lookAt(textMesh.position);

            } catch (error) {
                console.error('Error creating text geometry:', error);
            }
        })
        .catch(error => {
            console.error('Error loading font:', error);
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
    
    // Handle scramble state changes
    if (animationParams.scrambleEnabled && letterMeshes.length === 0) {
        // Initialize letter meshes when scramble is first enabled
        if (textMesh) {
            updateScrambleAnimation();
        }
    } else if (!animationParams.scrambleEnabled && letterMeshes.length > 0) {
        // Clean up letter meshes when scramble is disabled
        letterMeshes.forEach(mesh => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        letterMeshes = [];
        createText(); // Recreate single mesh
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