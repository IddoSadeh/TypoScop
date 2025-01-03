import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.152.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.152.0/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.0/examples/jsm/controls/OrbitControls.js';

import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';

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

export function createText() {
    const loader = new FontLoader();
    const fontUrl = 'https://unpkg.com/three@0.152.0/examples/fonts/helvetiker_regular.typeface.json';
    
    loader.load(fontUrl, (font) => {
        try {
            const geometry = new TextGeometry(textParams.text, {
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

            // Add debug logs
            console.log('Text position:', textMesh.position);
            console.log('Text bounding box:', geometry.boundingBox);
            console.log('Center offset:', centerOffset);

            scene.add(textMesh);

            // Optional: Look at text mesh
            camera.lookAt(textMesh.position);

        } catch (error) {
            console.error('Error creating text geometry:', error);
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

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}