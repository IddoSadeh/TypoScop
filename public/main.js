import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Global Three.js elements
let scene, camera, renderer, textMesh, controls;

// Text geometry parameters
const currentTextParams = {
    text: 'Hello, World!',
    size: 50,
    depth: 10,
    curveSegments: 12,
    font: 'helvetiker',
    bevelEnabled: false,
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelOffset: 0,
    bevelSegments: 3
};

// Material parameters
const materialParams = {
    // Standard Material Properties
    color: '#ffffff',
    metalness: 0,
    roughness: 0.5,
    wireframe: false,
    flatShading: false,
    
    // Physical Properties
    ior: 1.5,
    transmission: 0,
    thickness: 0,
    
    // Clearcoat Properties
    clearcoat: 0,
    clearcoatRoughness: 0,
    
    // Sheen Properties
    sheen: 0,
    sheenRoughness: 1.0,
    sheenColor: '#000000',
    
    // Emission Properties
    emissive: '#000000',
    emissiveIntensity: 0,
    
    // Common Material Properties
    opacity: 1,
    transparent: false,

     // Advanced Material Properties
     reflectivity: 0.5,
     specularIntensity: 1.0,
     specularColor: '#ffffff',
     
     // Anisotropy Properties
     anisotropy: 0,
     anisotropyRotation: 0,
     
     // Iridescence Properties
     iridescence: 0,
     iridescenceIOR: 1.3,
     
     // Attenuation Properties
     attenuationDistance: 1000,
     attenuationColor: '#ffffff',
     
     // Rendering Properties
     alphaTest: 0,
     depthTest: true,
     depthWrite: true,
     side: THREE.FrontSide
};

// Scene Properties
const sceneParams = {
    backgroundColor: '#000000',
    fogEnabled: false,
    fogColor: '#3f7b9d',
    fogDensity: 0.1
};

const cameraParams = {
    distance: 20,
    height: 0,
    rotationSpeed: 0
};

function initThreeJS(container) {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneParams.backgroundColor);

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 500);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    setupLighting();
    setupControls();
    createText(currentTextParams);
    animate();
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

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 100;
    controls.maxDistance = 800;
}

function setupSceneControls() {
    // Fog Controls
    const fogEnabled = document.getElementById('fog-enabled');
    const fogColor = document.getElementById('fog-color');
    const fogDensity = document.getElementById('fog-density');

    if (fogEnabled) {
        fogEnabled.checked = sceneParams.fogEnabled;
        fogEnabled.addEventListener('change', (e) => {
            sceneParams.fogEnabled = e.target.checked;
            scene.fog.enabled = sceneParams.fogEnabled;
        });
    }

    if (fogColor) {
        fogColor.value = sceneParams.fogColor;
        fogColor.addEventListener('input', (e) => {
            sceneParams.fogColor = e.target.value;
            scene.fog.color.set(sceneParams.fogColor);
        });
    }

    if (fogDensity) {
        fogDensity.value = sceneParams.fogDensity;
        fogDensity.nextElementSibling.textContent = sceneParams.fogDensity;
        fogDensity.addEventListener('input', (e) => {
            sceneParams.fogDensity = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = sceneParams.fogDensity;
            scene.fog = new THREE.FogExp2(sceneParams.fogColor, sceneParams.fogDensity);
        });
    }
}

function setupCameraControls() {
    const cameraDistance = document.getElementById('camera-distance');
    const cameraHeight = document.getElementById('camera-height');
    const rotationSpeed = document.getElementById('rotation-speed');

    if (cameraDistance) {
        cameraDistance.value = cameraParams.distance;
        cameraDistance.nextElementSibling.textContent = cameraParams.distance;
        cameraDistance.addEventListener('input', (e) => {
            cameraParams.distance = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = cameraParams.distance;
            updateCameraPosition();
        });
    }

    if (cameraHeight) {
        cameraHeight.value = cameraParams.height;
        cameraHeight.nextElementSibling.textContent = cameraParams.height;
        cameraHeight.addEventListener('input', (e) => {
            cameraParams.height = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = cameraParams.height;
            updateCameraPosition();
        });
    }

    if (rotationSpeed) {
        rotationSpeed.value = cameraParams.rotationSpeed;
        rotationSpeed.nextElementSibling.textContent = cameraParams.rotationSpeed;
        rotationSpeed.addEventListener('input', (e) => {
            cameraParams.rotationSpeed = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = cameraParams.rotationSpeed;
            updateAutoRotation();
        });
    }
}

function updateCameraPosition() {
    const direction = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(direction.multiplyScalar(cameraParams.distance));
    camera.position.y = cameraParams.height;
}

function updateAutoRotation() {
    if (cameraParams.rotationSpeed > 0) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = cameraParams.rotationSpeed * 10;
    } else {
        controls.autoRotate = false;
    }
}

function setupAdvancedMaterialControls() {
    const controls = {
        'reflectivity-slider': { param: 'reflectivity', type: 'number' },
        'specular-intensity': { param: 'specularIntensity', type: 'number' },
        'specular-color': { param: 'specularColor', type: 'color' },
        'anisotropy-slider': { param: 'anisotropy', type: 'number' },
        'anisotropy-rotation': { param: 'anisotropyRotation', type: 'number' },
        'iridescence-slider': { param: 'iridescence', type: 'number' },
        'iridescence-ior': { param: 'iridescenceIOR', type: 'number' },
        'attenuation-distance': { param: 'attenuationDistance', type: 'number' },
        'attenuation-color': { param: 'attenuationColor', type: 'color' },
        'alpha-test': { param: 'alphaTest', type: 'number' }
    };

    Object.entries(controls).forEach(([id, { param, type }]) => {
        const element = document.getElementById(id);
        if (!element) return;

        if (type === 'number') {
            element.value = materialParams[param];
            if (element.nextElementSibling) {
                element.nextElementSibling.textContent = materialParams[param];
            }
            element.addEventListener('input', (e) => {
                materialParams[param] = parseFloat(e.target.value);
                if (e.target.nextElementSibling) {
                    e.target.nextElementSibling.textContent = materialParams[param];
                }
                updateMaterial();
            });
        } else if (type === 'color') {
            element.value = materialParams[param];
            element.addEventListener('input', (e) => {
                materialParams[param] = e.target.value;
                updateMaterial();
            });
        }
    });

    // Setup checkboxes
    const depthTest = document.getElementById('depth-test');
    const depthWrite = document.getElementById('depth-write');
    
    if (depthTest) {
        depthTest.checked = materialParams.depthTest;
        depthTest.addEventListener('change', (e) => {
            materialParams.depthTest = e.target.checked;
            updateMaterial();
        });
    }

    if (depthWrite) {
        depthWrite.checked = materialParams.depthWrite;
        depthWrite.addEventListener('change', (e) => {
            materialParams.depthWrite = e.target.checked;
            updateMaterial();
        });
    }

    // Setup side select
    const sideSelect = document.getElementById('side-select');
    if (sideSelect) {
        sideSelect.addEventListener('change', (e) => {
            switch(e.target.value) {
                case 'front':
                    materialParams.side = THREE.FrontSide;
                    break;
                case 'back':
                    materialParams.side = THREE.BackSide;
                    break;
                case 'double':
                    materialParams.side = THREE.DoubleSide;
                    break;
            }
            updateMaterial();
        });
    }
}


function createMaterial() {
    return new THREE.MeshPhysicalMaterial({
        // Base properties
        color: new THREE.Color(materialParams.color),
        metalness: materialParams.metalness,
        roughness: materialParams.roughness,
        wireframe: materialParams.wireframe,
        flatShading: materialParams.flatShading,

        // Emission properties
        emissive: new THREE.Color(materialParams.emissive),
        emissiveIntensity: materialParams.emissiveIntensity,

        // Physical properties
        ior: materialParams.ior,
        reflectivity: materialParams.reflectivity,
        transmission: materialParams.transmission,
        thickness: materialParams.thickness,

        // Clearcoat properties
        clearcoat: materialParams.clearcoat,
        clearcoatRoughness: materialParams.clearcoatRoughness,

        // Sheen properties
        sheen: materialParams.sheen,
        sheenRoughness: materialParams.sheenRoughness,
        sheenColor: new THREE.Color(materialParams.sheenColor),

        // Specular properties
        specularIntensity: materialParams.specularIntensity,
        specularColor: new THREE.Color(materialParams.specularColor),

        // Anisotropy properties
        anisotropy: materialParams.anisotropy,
        anisotropyRotation: materialParams.anisotropyRotation,

        // Iridescence properties
        iridescence: materialParams.iridescence,
        iridescenceIOR: materialParams.iridescenceIOR,

        // Attenuation properties
        attenuationDistance: materialParams.attenuationDistance,
        attenuationColor: new THREE.Color(materialParams.attenuationColor),

        // Rendering properties
        transparent: materialParams.transparent || materialParams.transmission > 0,
        opacity: materialParams.opacity,
        depthTest: materialParams.depthTest,
        depthWrite: materialParams.depthWrite,
        alphaTest: materialParams.alphaTest,
        side: materialParams.side
    });
}

function createText(params) {
    const fontLoader = new FontLoader();
    const fontPath = `https://cdn.jsdelivr.net/npm/three@0.152.0/examples/fonts/${params.font}_regular.typeface.json`;

    fontLoader.load(fontPath, (font) => {
        if (textMesh) {
            scene.remove(textMesh);
            textMesh.geometry.dispose();
            textMesh.material.dispose();
        }

        const geometry = new TextGeometry(params.text, {
            font: font,
            size: params.size,
            height: params.depth,
            curveSegments: params.curveSegments,
            bevelEnabled: params.bevelEnabled,
            bevelThickness: params.bevelThickness,
            bevelSize: params.bevelSize,
            bevelOffset: params.bevelOffset,
            bevelSegments: params.bevelSegments
        });

        const material = createMaterial();
        textMesh = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        textMesh.position.x = centerOffset;

        scene.add(textMesh);
    });
}

function updateMaterial() {
    if (textMesh && textMesh.material) {
        const newMaterial = createMaterial();
        textMesh.material.dispose();
        textMesh.material = newMaterial;
    }
}

function updateChatHistory(role, content) {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.className = role === 'user' ? 'user-message' : 'ai-message';
    message.textContent = `${role === 'user' ? 'You' : 'AI'}: ${content}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateUIControls() {
    // Update all sliders
    const sliderMappings = {
        // Geometry sliders
        'size-slider': { value: currentTextParams.size, target: 'value-display' },
        'depth-slider': { value: currentTextParams.depth, target: 'value-display' },
        'curveSegments-slider': { value: currentTextParams.curveSegments, target: 'value-display' },
        'bevelThickness-slider': { value: currentTextParams.bevelThickness, target: 'value-display' },
        'bevelSize-slider': { value: currentTextParams.bevelSize, target: 'value-display' },
        
        // Material sliders
        'metalness-slider': { value: materialParams.metalness, target: 'value-display' },
        'roughness-slider': { value: materialParams.roughness, target: 'value-display' },
        'ior-slider': { value: materialParams.ior, target: 'value-display' },
        'transmission-slider': { value: materialParams.transmission, target: 'value-display' },
        'clearcoat-slider': { value: materialParams.clearcoat, target: 'value-display' },
        'clearcoatRoughness-slider': { value: materialParams.clearcoatRoughness, target: 'value-display' },
        'sheen-slider': { value: materialParams.sheen, target: 'value-display' },
        'sheenRoughness-slider': { value: materialParams.sheenRoughness, target: 'value-display' },
        'opacity-slider': { value: materialParams.opacity, target: 'value-display' }
    };

    // Update sliders and their value displays
    Object.entries(sliderMappings).forEach(([id, { value, target }]) => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.value = value;
            const displayElement = slider.nextElementSibling;
            if (displayElement) {
                displayElement.textContent = typeof value === 'number' ? 
                    (id === 'ior-slider' ? value.toFixed(3) : value.toFixed(1)) : 
                    value;
            }
        }
    });

    // Update color pickers
    const colorMappings = {
        'color-picker': materialParams.color,
        'emissive-picker': materialParams.emissive,
        'sheenColor-picker': materialParams.sheenColor,
        'background-picker': sceneParams.backgroundColor
    };

    Object.entries(colorMappings).forEach(([id, value]) => {
        const picker = document.getElementById(id);
        if (picker) {
            picker.value = value;
        }
    });

    // Update toggles/checkboxes
    const toggleMappings = {
        'bevel-enabled': currentTextParams.bevelEnabled,
        'wireframe-enabled': materialParams.wireframe,
        'transparent-enabled': materialParams.transparent,
        'flatShading-enabled': materialParams.flatShading
    };

    Object.entries(toggleMappings).forEach(([id, value]) => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.checked = value;
        }
    });

    // Update font selector
    const fontSelect = document.getElementById('font-name');
    if (fontSelect) {
        fontSelect.value = currentTextParams.font;
    }
}

// Modify handleAPIResponse to include UI update
function handleAPIResponse(result) {
    if (result.response) {
        updateChatHistory('ai', `Updated parameters: ${JSON.stringify(result.response)}`);
        
        // Update geometry parameters
        Object.assign(currentTextParams, {
            text: result.response.text,
            size: result.response.size,
            depth: result.response.depth,
            font: result.response.font,
            curveSegments: result.response.curveSegments,
            bevelEnabled: result.response.bevelEnabled,
            bevelThickness: result.response.bevelThickness,
            bevelSize: result.response.bevelSize,
            bevelOffset: result.response.bevelOffset,
            bevelSegments: result.response.bevelSegments
        });

        // Update material parameters
        Object.assign(materialParams, {
            // Base properties
            color: result.response.color,
            metalness: result.response.metalness,
            roughness: result.response.roughness,
            wireframe: result.response.wireframe,
            flatShading: result.response.flatShading,

            // Physical properties
            ior: result.response.ior,
            transmission: result.response.transmission,
            thickness: result.response.thickness,
            reflectivity: result.response.reflectivity,

            // Emission properties
            emissive: result.response.emissive,
            emissiveIntensity: result.response.emissiveIntensity,

            // Clearcoat properties
            clearcoat: result.response.clearcoat,
            clearcoatRoughness: result.response.clearcoatRoughness,

            // Sheen properties
            sheen: result.response.sheen,
            sheenRoughness: result.response.sheenRoughness,
            sheenColor: result.response.sheenColor,

            // Specular properties
            specularIntensity: result.response.specularIntensity,
            specularColor: result.response.specularColor,

            // Anisotropy properties
            anisotropy: result.response.anisotropy,
            anisotropyRotation: result.response.anisotropyRotation,

            // Iridescence properties
            iridescence: result.response.iridescence,
            iridescenceIOR: result.response.iridescenceIOR,

            // Attenuation properties
            attenuationDistance: result.response.attenuationDistance,
            attenuationColor: result.response.attenuationColor,

            // Common properties
            opacity: result.response.opacity,
            transparent: result.response.transparent,
            depthTest: result.response.depthTest,
            depthWrite: result.response.depthWrite,
            alphaTest: result.response.alphaTest,
            side: result.response.side
        });

        // Update scene parameters
        Object.assign(sceneParams, {
            backgroundColor: result.response.backgroundColor,
            fogEnabled: result.response.fogEnabled,
            fogColor: result.response.fogColor,
            fogDensity: result.response.fogDensity
        });

        // Update camera parameters
        Object.assign(cameraParams, {
            distance: result.response.cameraDistance,
            height: result.response.cameraHeight,
            rotationSpeed: result.response.rotationSpeed
        });

        // Apply scene updates
        scene.background = new THREE.Color(sceneParams.backgroundColor);
        if (scene.fog) {
            scene.fog.enabled = sceneParams.fogEnabled;
            scene.fog.color.set(sceneParams.fogColor);
            scene.fog = new THREE.FogExp2(sceneParams.fogColor, sceneParams.fogDensity);
        }

        // Apply camera updates
        updateCameraPosition();
        updateAutoRotation();

        // Update UI to reflect new values
        updateUIControls();

        // Recreate text with new parameters
        createText(currentTextParams);
    } else {
        updateChatHistory('ai', 'Error processing the request.');
    }
}

// UI Setup Functions
function setupSliders() {
    const sliderMappings = {
        // Geometry sliders
        'size-slider': { param: 'size', target: currentTextParams, recreate: true },
        'depth-slider': { param: 'depth', target: currentTextParams, recreate: true },
        'curveSegments-slider': { param: 'curveSegments', target: currentTextParams, recreate: true },
        'bevelThickness-slider': { param: 'bevelThickness', target: currentTextParams, recreate: true },
        'bevelSize-slider': { param: 'bevelSize', target: currentTextParams, recreate: true },
        
        // Material sliders
        'metalness-slider': { param: 'metalness', target: materialParams, recreate: false },
        'roughness-slider': { param: 'roughness', target: materialParams, recreate: false },
        'ior-slider': { param: 'ior', target: materialParams, recreate: false },
        'transmission-slider': { param: 'transmission', target: materialParams, recreate: false },
        'clearcoat-slider': { param: 'clearcoat', target: materialParams, recreate: false },
        'clearcoatRoughness-slider': { param: 'clearcoatRoughness', target: materialParams, recreate: false },
        'sheen-slider': { param: 'sheen', target: materialParams, recreate: false },
        'sheenRoughness-slider': { param: 'sheenRoughness', target: materialParams, recreate: false },
        'opacity-slider': { param: 'opacity', target: materialParams, recreate: false }
    };

    Object.entries(sliderMappings).forEach(([id, { param, target, recreate }]) => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.value = target[param];
            slider.nextElementSibling.textContent = target[param];
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                target[param] = value;
                e.target.nextElementSibling.textContent = value.toFixed(
                    param === 'ior' ? 3 : 1
                );
                
                if (recreate) {
                    createText(currentTextParams);
                } else {
                    updateMaterial();
                }
            });
        }
    });
}

function setupColorPickers() {
    const colorMappings = {
        'color-picker': { param: 'color', target: materialParams },
        'emissive-picker': { param: 'emissive', target: materialParams },
        'sheenColor-picker': { param: 'sheenColor', target: materialParams },
        'background-picker': { param: 'backgroundColor', target: sceneParams }
    };

    Object.entries(colorMappings).forEach(([id, { param, target }]) => {
        const picker = document.getElementById(id);
        if (picker) {
            picker.value = target[param];
            picker.addEventListener('input', (e) => {
                target[param] = e.target.value;
                if (param === 'backgroundColor') {
                    scene.background = new THREE.Color(e.target.value);
                } else {
                    updateMaterial();
                }
            });
        }
    });
}

function setupToggles() {
    const toggleMappings = {
        'bevel-enabled': { param: 'bevelEnabled', target: currentTextParams, recreate: true },
        'wireframe-enabled': { param: 'wireframe', target: materialParams, recreate: false },
        'transparent-enabled': { param: 'transparent', target: materialParams, recreate: false },
        'flatShading-enabled': { param: 'flatShading', target: materialParams, recreate: true }
    };

    Object.entries(toggleMappings).forEach(([id, { param, target, recreate }]) => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.checked = target[param];
            toggle.addEventListener('change', (e) => {
                target[param] = e.target.checked;
                if (recreate) {
                    createText(currentTextParams);
                } else {
                    updateMaterial();
                }
            });
        }
    });
}

function setupFontChooser() {
    const fontSelect = document.getElementById('font-name');
    if (fontSelect) {
        fontSelect.value = currentTextParams.font;
        fontSelect.addEventListener('change', (e) => {
            currentTextParams.font = e.target.value;
            createText(currentTextParams);
        });
    }
}

function setupAPIListener() {
    const apiButton = document.getElementById('send');
    const promptInput = document.getElementById('promptInput');

    if (apiButton && promptInput) {
        apiButton.addEventListener('click', async () => {
            try {
                const prompt = promptInput.value.trim();
                if (!prompt) return;

                updateChatHistory('user', prompt);
                const response = await fetch('/api/customize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                handleAPIResponse(result);
                promptInput.value = '';
            } catch (error) {
                console.error('API Error:', error);
                updateChatHistory('ai', 'Error: Could not connect to the server.');
            }
        });
    }
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');

            button.classList.add('active');
            const tabId = button.dataset.tab;
            const activeTab = document.getElementById(`${tabId}-tab`);
            if (activeTab) {
                activeTab.style.display = 'block';
                window.dispatchEvent(new Event('resize'));
            }
        });
    });
}

function setupCollapsibles() {
    document.querySelectorAll('.collapsible').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.style.maxHeight = this.classList.contains('active') ? 
                `${content.scrollHeight}px` : null;
            content.classList.toggle('show');
        });
    });
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    controls?.update();
    renderer.render(scene, camera);
}

// Initialization
function init() {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found');
        return;
    }

    initThreeJS(container);
    window.addEventListener('resize', onWindowResize);
    
    setupAPIListener();
    setupSliders();
    setupColorPickers();
    setupFontChooser();
    setupTabs();
    setupCollapsibles();
    setupSceneControls();         
    setupCameraControls();        
    setupAdvancedMaterialControls(); 
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);