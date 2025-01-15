import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.152.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.152.0/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { TessellateModifier } from 'https://unpkg.com/three@0.152.0/examples/jsm/modifiers/TessellateModifier.js';

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


// First, let's create shader constants at the top of the file
const vertexShader = `
    uniform float amplitude;
    attribute vec3 customColor;
    attribute vec3 displacement;
    varying vec3 vNormal;
    varying vec3 vColor;

    void main() {
        vNormal = normal;
        vColor = customColor;
        vec3 newPosition = position + normal * amplitude * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

const fragmentShader = `
    uniform float metalness;
    uniform float roughness;
    varying vec3 vNormal;
    varying vec3 vColor;

    void main() {
        const float ambient = 0.4;
        vec3 light = vec3(1.0);
        light = normalize(light);

        float directional = max(dot(vNormal, light), 0.0);
        float metallicFactor = 1.0 - roughness;
        float specular = pow(directional, 10.0 * metallicFactor) * metalness;
        
        vec3 finalColor = (directional + ambient + specular) * vColor;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

function createTessellatedGeometry(geometry) {
    const tessellatedGeometry = geometry.clone();
    const tessellateModifier = new TessellateModifier(materialParams.tessellationSegments, 6);
    tessellateModifier.modify(tessellatedGeometry);

    // Calculate number of faces
    const numFaces = tessellatedGeometry.attributes.position.count / 3;
    const colors = new Float32Array(numFaces * 3 * 3);
    const displacement = new Float32Array(numFaces * 3 * 3);
    const color = new THREE.Color();
    const baseColor = new THREE.Color(materialParams.color);

    // Assign colors and displacement to each face
    for (let f = 0; f < numFaces; f++) {
        const index = 9 * f;
        let h, s, l;
        
        const baseHSL = {};
        baseColor.getHSL(baseHSL);

        // Calculate color based on pattern
        switch (materialParams.tessellationPattern) {
            case 'gradient':
                const gradientProgress = f / numFaces;
                h = baseHSL.h + (materialParams.tessellationHueRange * gradientProgress);
                s = baseHSL.s + (materialParams.tessellationSatRange * gradientProgress);
                l = baseHSL.l + (materialParams.tessellationLightRange * gradientProgress);
                break;
            case 'waves':
                const wave = Math.sin(f * 0.1);
                h = baseHSL.h + (materialParams.tessellationHueRange * wave * 0.5);
                s = baseHSL.s + (materialParams.tessellationSatRange * wave * 0.5);
                l = baseHSL.l + (materialParams.tessellationLightRange * wave * 0.5);
                break;
            default: // random
                h = baseHSL.h + (Math.random() - 0.5) * materialParams.tessellationHueRange;
                s = baseHSL.s + (Math.random() - 0.5) * materialParams.tessellationSatRange;
                l = baseHSL.l + (Math.random() - 0.5) * materialParams.tessellationLightRange;
                break;
        }

        h = ((h % 1) + 1) % 1;
        s = Math.max(0, Math.min(1, s));
        l = Math.max(0, Math.min(1, l));

        color.setHSL(h, s, l);
        const d = 10 * (0.5 - Math.random());

        for (let i = 0; i < 3; i++) {
            colors[index + (3 * i)] = color.r;
            colors[index + (3 * i) + 1] = color.g;
            colors[index + (3 * i) + 2] = color.b;

            displacement[index + (3 * i)] = d;
            displacement[index + (3 * i) + 1] = d;
            displacement[index + (3 * i) + 2] = d;
        }
    }

    tessellatedGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    tessellatedGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));

    return tessellatedGeometry;
}

function createShaderMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            amplitude: { value: 0.0 },
            metalness: { value: materialParams.metalness },
            roughness: { value: materialParams.roughness }
        },
        vertexShader,
        fragmentShader,
        wireframe: false
    });
}

function createMaterial(geometry) {
    if (materialParams.tessellationEnabled) {
        const tessellatedGeometry = createTessellatedGeometry(geometry);
        return {
            geometry: tessellatedGeometry,
            material: createShaderMaterial()
        };
    } else {
        return {
            geometry: geometry,
            material: new THREE.MeshStandardMaterial({
                color: new THREE.Color(materialParams.color),
                metalness: materialParams.metalness,
                roughness: materialParams.roughness
            })
        };
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

                // Create material using our new function
                const materialObject = createMaterial(geometry);
                            
                // Clean up old mesh
                if (textMesh) {
                    scene.remove(textMesh);
                    textMesh.geometry.dispose();
                    textMesh.material.dispose();
                }
                
                // Create new mesh with tessellated or standard material
                textMesh = new THREE.Mesh(
                    materialObject.geometry, 
                    materialObject.material
                );
  
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

export function updateMaterial() {
    if (textMesh) {
        if (materialParams.tessellationEnabled) {
            // For tessellated material, we need to recreate the geometry with new colors
            const materialObject = createMaterial(textMesh.geometry.clone());
            
            // Clean up old geometry
            if (textMesh.geometry) {
                textMesh.geometry.dispose();
            }
            
            // Update mesh with new geometry and material
            textMesh.geometry = materialObject.geometry;
            textMesh.material.dispose();
            textMesh.material = materialObject.material;
            
            // If we have copies, update them too
            if (animationParams.multiTextEnabled && animationParams.copies) {
                animationParams.copies.forEach(copy => {
                    if (copy.mesh && copy.mesh !== textMesh) {
                        const copyMaterialObject = createMaterial(textMesh.geometry.clone());
                        copy.mesh.geometry.dispose();
                        copy.mesh.material.dispose();
                        copy.mesh.geometry = copyMaterialObject.geometry;
                        copy.mesh.material = copyMaterialObject.material;
                    }
                });
            }
            
            // If we have letter meshes, update them too
            if (letterMeshes.length > 0) {
                letterMeshes.forEach(mesh => {
                    const letterMaterialObject = createMaterial(mesh.geometry.clone());
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                    mesh.geometry = letterMaterialObject.geometry;
                    mesh.material = letterMaterialObject.material;
                });
            }
        } else {
            // Standard material update
            textMesh.material.color.set(materialParams.color);
            textMesh.material.metalness = materialParams.metalness;
            textMesh.material.roughness = materialParams.roughness;
        }
    }
}

export function updateSceneBackground() {
    scene.background.set(sceneParams.backgroundColor);
}

export function getTextMesh() {
    return textMesh;
}

function getRandomPosition(spread) {
    return {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * (spread * 0.5) // Less spread in Z for better readability
    };
}


export function updateMultiTextCopies() {
    

    
    if (!animationParams.multiTextEnabled) {
        if (animationParams.copies) {
            animationParams.copies.forEach(copy => {
                if (copy && copy.mesh && copy.mesh !== textMesh) {
                    scene.remove(copy.mesh);
                    if (copy.mesh.geometry) copy.mesh.geometry.dispose();
                    if (copy.mesh.material) copy.mesh.material.dispose();
                }
            });

            letterMeshes = letterMeshes.filter(mesh => {
                if (!mesh.userData.copyRef || mesh.userData.copyRef.mesh === textMesh) {
                    return true; 
                }
                scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
                return false;
            });
            
         
        }
        animationParams.copies = [];
        return;
    }



    // Clean up existing copies
    if (animationParams.copies) {
        animationParams.copies.forEach(copy => {
            if (copy && copy.mesh && copy.mesh !== textMesh) {
                scene.remove(copy.mesh);
                if (copy.mesh.geometry) copy.mesh.geometry.dispose();
                if (copy.mesh.material) copy.mesh.material.dispose();
            }
        });
    }
    
    if (!textMesh) return;
    
    // Initialize copies array
    animationParams.copies = [];
    
    // Store current animation state of original mesh if it exists
    const originalRotation = textMesh ? textMesh.rotation.clone() : new THREE.Euler();
    const originalScale = textMesh ? textMesh.scale.clone() : new THREE.Vector3(1, 1, 1);
    
    // Create copies
    for (let i = 0; i < animationParams.copyCount; i++) {
        const position = getRandomPosition(animationParams.spread);
        
        if (i === 0) {
            // Use original mesh for first copy
            textMesh.position.set(position.x, position.y, position.z);
            
            // Keep existing rotation and scale if they exist
            if (animationParams.rotateXEnabled || animationParams.rotateYEnabled || animationParams.rotateZEnabled) {
                textMesh.rotation.copy(originalRotation);
            }
            if (animationParams.scaleEnabled) {
                textMesh.scale.copy(originalScale);
            }
            
            animationParams.copies.push({
                mesh: textMesh,
                basePosition: new THREE.Vector3(position.x, position.y, position.z),
                rotationOffset: new THREE.Vector3(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                )
            });
            continue;
        }
        
        // Create new mesh
        const copyMaterial = textMesh.material.clone();
        const copyMesh = new THREE.Mesh(textMesh.geometry, copyMaterial);
        
        copyMesh.position.set(position.x, position.y, position.z);
        
        if (animationParams.rotateXEnabled || animationParams.rotateYEnabled || animationParams.rotateZEnabled) {
            copyMesh.rotation.copy(originalRotation);
        }
        if (animationParams.scaleEnabled) {
            copyMesh.scale.copy(originalScale);
        }

        if (animationParams.scrambleEnabled) {
            cleanupLetterMeshes();
        }


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
}


function updateScrambleAnimation() {
    if (!animationParams.scrambleEnabled) return;
    
    // Initialize letter meshes when scramble is first enabled
    if (letterMeshes.length === 0) {
        letterMeshes = []; // Clear array just in case
        
        if (animationParams.multiTextEnabled && animationParams.copies) {
            // Handle multiple copies
            animationParams.copies.forEach(copy => {
                if (!copy.mesh) return;
                
                const textContent = textParams.text;
                const letterSpacing = textParams.size * 0.6;
                
                // Hide the original mesh
                copy.mesh.visible = false;
                
                // Calculate total width for centering
                const totalWidth = textContent.length * letterSpacing;
                let startX = -totalWidth / 2 + copy.basePosition.x;
                
                // Create individual letter meshes for this copy
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

                    // Use createMaterial function instead of basic material
                    const materialObject = createMaterial(geometry);
                    const letterMesh = new THREE.Mesh(
                        materialObject.geometry,
                        materialObject.material
                    );
                    
                    // Set initial position
                    letterMesh.position.set(
                        startX + (index * letterSpacing),
                        copy.basePosition.y,
                        copy.basePosition.z
                    );
                    
                    // Store original position and copy reference
                    letterMesh.userData.originalX = letterMesh.position.x;
                    letterMesh.userData.originalY = letterMesh.position.y;
                    letterMesh.userData.originalZ = letterMesh.position.z;
                    letterMesh.userData.copyRef = copy;
                    
                    scene.add(letterMesh);
                    letterMeshes.push(letterMesh);
                });
            });
        } else if (textMesh) {
            // Original single text scramble logic
            const textContent = textParams.text;
            const letterSpacing = textParams.size * 0.6;
            
            textMesh.visible = false;
            
            const totalWidth = textContent.length * letterSpacing;
            let startX = -totalWidth / 2;
            
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

                // Use createMaterial function instead of basic material
                const materialObject = createMaterial(geometry);
                const letterMesh = new THREE.Mesh(
                    materialObject.geometry,
                    materialObject.material
                );
                
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

    // Rest of the animation code remains the same...
    const intensity = animationParams.scrambleIntensity || 1;
    const speed = animationParams.scrambleSpeed || 0.5;
    
    letterMeshes.forEach((mesh, index) => {
        switch(animationParams.scrambleMode) {
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


function cleanupLetterMeshes() {
    letterMeshes.forEach(mesh => {
        scene.remove(mesh);
        if (mesh.geometry) {
            mesh.geometry.dispose();
        }
        if (mesh.material) {
            if (mesh.material.vertexColors) {
                // Clean up vertex color attributes
                const colorAttribute = mesh.geometry.getAttribute('color');
                if (colorAttribute) {
                    colorAttribute.array = null;
                    mesh.geometry.deleteAttribute('color');
                }
            }
            mesh.material.dispose();
        }
    });
    letterMeshes = [];

    if (animationParams.multiTextEnabled) {
        animationParams.copies.forEach(copy => {
            if (copy.mesh) copy.mesh.visible = true;
        });
    } else if (textMesh) {
        textMesh.visible = true;
    }
}

function updateAnimation() {
    if (!textMesh && letterMeshes.length === 0) return;
    
    // Handle scramble initialization/cleanup regardless of multi-text mode
    if (letterMeshes.length > 0 && !animationParams.scrambleEnabled) {
        cleanupLetterMeshes();
    } else if (animationParams.scrambleEnabled) {
        updateScrambleAnimation();
    }

    // If we have letter meshes (scramble is active), animate those
    if (letterMeshes.length > 0) {
        // Apply rotations and scale to letter meshes
        letterMeshes.forEach(mesh => {
            if (animationParams.rotateXEnabled) {
                mesh.rotation.x += animationParams.rotateX;
            }
            if (animationParams.rotateYEnabled) {
                mesh.rotation.y += animationParams.rotateY;
            }
            if (animationParams.rotateZEnabled) {
                mesh.rotation.z += animationParams.rotateZ;
            }

            if (animationParams.scaleEnabled) {
                mesh.scale.set(
                    animationParams.currentScale,
                    animationParams.currentScale,
                    animationParams.currentScale
                );
            }
        });
    } 
    // Otherwise animate the whole text meshes
    else if (animationParams.multiTextEnabled) {
        animationParams.copies.forEach((copy, index) => {
            if (!copy.mesh) return;
            
            if (animationParams.rotateXEnabled) {
                const rotationAmount = animationParams.rotateX;
                copy.mesh.rotation.x += animationParams.rotateIndependently ? 
                    rotationAmount * (1 + copy.rotationOffset.x) : 
                    rotationAmount;
            }
            
            if (animationParams.rotateYEnabled) {
                const rotationAmount = animationParams.rotateY;
                copy.mesh.rotation.y += animationParams.rotateIndependently ? 
                    rotationAmount * (1 + copy.rotationOffset.y) : 
                    rotationAmount;
            }
            
            if (animationParams.rotateZEnabled) {
                const rotationAmount = animationParams.rotateZ;
                copy.mesh.rotation.z += animationParams.rotateIndependently ? 
                    rotationAmount * (1 + copy.rotationOffset.z) : 
                    rotationAmount;
            }
            
            if (animationParams.scaleEnabled) {
                const scaleOffset = Math.sin(Date.now() * 0.003 + index * 0.5) * 0.2;
                const scale = animationParams.currentScale + (animationParams.rotateIndependently ? scaleOffset : 0);
                copy.mesh.scale.set(scale, scale, scale);
            }
        });
    } else {
        // Single text mesh animations
        if (animationParams.rotateXEnabled) {
            textMesh.rotation.x += animationParams.rotateX;
        }
        if (animationParams.rotateYEnabled) {
            textMesh.rotation.y += animationParams.rotateY;
        }
        if (animationParams.rotateZEnabled) {
            textMesh.rotation.z += animationParams.rotateZ;
        }

        if (animationParams.scaleEnabled) {
            textMesh.scale.set(
                animationParams.currentScale,
                animationParams.currentScale,
                animationParams.currentScale
            );
        }
        
    }

    // Update scale values
    if (animationParams.scaleEnabled) {
        animationParams.currentScale += animationParams.scaleSpeed * animationParams.scaleDirection;
        
        if (animationParams.currentScale >= animationParams.scaleMax) {
            animationParams.scaleDirection = -1;
            animationParams.currentScale = animationParams.scaleMax;
        } else if (animationParams.currentScale <= animationParams.scaleMin) {
            animationParams.scaleDirection = 1;
            animationParams.currentScale = animationParams.scaleMin;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Update all tessellated meshes
    const updateMeshAmplitude = (mesh) => {
        if (mesh && mesh.material.type === 'ShaderMaterial' && mesh.material.uniforms) {
            if (materialParams.tessellationAnimationEnabled) {
                const time = Date.now() * 0.001 * materialParams.tessellationAnimationSpeed;
                mesh.material.uniforms.amplitude.value = 
                    materialParams.tessellationAnimationIntensity * Math.sin(time);
            } else {
                mesh.material.uniforms.amplitude.value = 0;
            }
            
            // Always update material properties
            mesh.material.uniforms.metalness.value = materialParams.metalness;
            mesh.material.uniforms.roughness.value = materialParams.roughness;
        }
    };

    // Update main mesh
    if (materialParams.tessellationEnabled) {
        updateMeshAmplitude(textMesh);
    }

    // Update copies if they exist
    if (animationParams.multiTextEnabled && animationParams.copies) {
        animationParams.copies.forEach(copy => updateMeshAmplitude(copy.mesh));
    }

    // Update letter meshes if they exist
    if (letterMeshes.length > 0) {
        letterMeshes.forEach(mesh => updateMeshAmplitude(mesh));
    }

    updateAnimation();
    controls.update();
    renderer.render(scene, camera);
}