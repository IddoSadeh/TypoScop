import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, textMesh, controls;

let currentTextParams = {
    text: 'Hello, World!',
    size: 50,
    depth: 10,
    font: 'helvetiker',
    curveSegments: 12,
    bevelEnabled: false,
    bevelThickness: 2,
    bevelSize: 1.5,
    color: '#ffffff',
    font: 'helvetiker', // Default font
    backgroundColor: '#000000',
};

function init() {
    const container = document.getElementById('canvas-container');

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(currentTextParams.backgroundColor);

    // Camera setup
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 1000);
    camera.position.set(0, 0, 500);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 50, 50);
    scene.add(light);

    // OrbitControls for mouse interactions
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.zoomSpeed = 1.2;
    controls.enablePan = true;
    controls.enableRotate = true;

    // Resize handling
    window.addEventListener('resize', onWindowResize);

    animate();
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function createText(params) {
    const fontLoader = new FontLoader();
    const fontPath = `https://cdn.jsdelivr.net/npm/three@0.152.0/examples/fonts/${params.font}_regular.typeface.json`;

    fontLoader.load(fontPath, (font) => {
        // Remove the previous textMesh if it exists
        if (textMesh) {
            scene.remove(textMesh);
            textMesh.geometry.dispose();
            textMesh.material.dispose();
        }

        const geometry = new TextGeometry(params.text, {
            font: font,
            size: params.size,
            depth: Math.max(0.1, params.depth), // Prevent depth from being too small
            curveSegments: params.curveSegments,
            bevelEnabled: params.bevelEnabled,
            bevelThickness: params.bevelThickness,
            bevelSize: params.bevelSize,
        });

        const material = new THREE.MeshPhongMaterial({ color: params.color });
        textMesh = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        textMesh.position.x = centerOffset;

        scene.add(textMesh);

        // Update background color
        scene.background = new THREE.Color(params.backgroundColor);
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function updateChatHistory(role, content) {
    const chatBox = document.getElementById('chat-box');
    const message = document.createElement('div');
    message.className = role === 'user' ? 'user-message' : 'ai-message';
    message.textContent = `${role === 'user' ? 'You' : 'AI'}: ${content}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function setupSliders() {
    // Initialize sliders with current state
    document.getElementById('size-slider').value = currentTextParams.size;
    document.getElementById('depth-slider').value = currentTextParams.depth;
    document.getElementById('curveSegments-slider').value = currentTextParams.curveSegments;
    document.getElementById('bevelThickness-slider').value = currentTextParams.bevelThickness;
    document.getElementById('bevelSize-slider').value = currentTextParams.bevelSize;

    // Add event listeners
    document.getElementById('size-slider').addEventListener('input', (e) => {
        currentTextParams.size = parseFloat(e.target.value);
        createText(currentTextParams);
    });

    document.getElementById('depth-slider').addEventListener('input', (e) => {
        currentTextParams.depth = parseFloat(e.target.value);
        createText(currentTextParams);
    });

    document.getElementById('curveSegments-slider').addEventListener('input', (e) => {
        currentTextParams.curveSegments = parseInt(e.target.value, 10);
        createText(currentTextParams);
    });

    document.getElementById('bevelThickness-slider').addEventListener('input', (e) => {
        currentTextParams.bevelThickness = parseFloat(e.target.value);
        createText(currentTextParams);
    });

    document.getElementById('bevelSize-slider').addEventListener('input', (e) => {
        currentTextParams.bevelSize = parseFloat(e.target.value);
        createText(currentTextParams);
    });
}

function setupFontChooser() {
  const fontSelect = document.querySelector('#font-name');
  fontSelect.value = currentTextParams.font; // Set dropdown to current font
  fontSelect.addEventListener('change', (e) => {
      const selectedFont = e.target.value.toLowerCase();
      if (selectedFont) {
          currentTextParams.font = selectedFont;
          createText(currentTextParams);
      }
  });
}


function setupAPIListener() {
    const apiButton = document.getElementById('send');
    const promptInput = document.getElementById('promptInput');

    apiButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        updateChatHistory('user', prompt);

        const response = await fetch('/api/customize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        const result = await response.json();
        if (result.response) {
            updateChatHistory('ai', `Updated parameters: ${JSON.stringify(result.response)}`);
            currentTextParams = { ...currentTextParams, ...result.response };
            createText(currentTextParams);
        } else {
            updateChatHistory('ai', 'Error processing the request.');
        }
    });
}

// Initialize
init();
setupAPIListener();
setupSliders();
setupFontChooser();
