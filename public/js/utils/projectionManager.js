// projectionManager.js
import * as THREE from 'three';
import { projectionParams } from '../parameters/projectionParams.js';
import { createText } from './three.setup.js';

let scene = null;
let renderer = null;
let camera = null;
let currentProjection = null;
let renderTarget = null;

/*──────────────────────────────────────────────────────────────
  INITIALIZATION
──────────────────────────────────────────────────────────────*/
export function initProjectionManager(threeScene, threeRenderer, threeCamera) {
    scene = threeScene;
    renderer = threeRenderer;
    camera = threeCamera;
}

/*──────────────────────────────────────────────────────────────
  CLEANUP AND RESOURCE MANAGEMENT
──────────────────────────────────────────────────────────────*/
function disposeMesh(mesh) {
    if (!mesh) return;
    
    scene.remove(mesh);
    
    if (mesh.geometry) {
        mesh.geometry.dispose();
    }
    
    if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose());
    } else if (mesh.material) {
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

function cleanup() {
    if (currentProjection) {
        disposeMesh(currentProjection);
        currentProjection = null;
    }
    if (renderTarget) {
        renderTarget.dispose();
        renderTarget = null;
    }
}

/*──────────────────────────────────────────────────────────────
  GEOMETRY CREATION
──────────────────────────────────────────────────────────────*/
function createProjectionGeometry() {
    switch (projectionParams.mode) {
        case 'torusknot':
            return new THREE.TorusKnotGeometry(
                10, 3,
                projectionParams.segments.torusknot.turns,
                projectionParams.segments.torusknot.tubes
            );
        case 'cube':
            return new THREE.BoxGeometry(10, 10, 10);
        case 'sphere':
            return new THREE.SphereGeometry(
                7,
                projectionParams.segments.sphere.width,
                projectionParams.segments.sphere.height
            );
        case 'twisted':
            return new THREE.TorusKnotGeometry(
                10, 2.5,
                projectionParams.segments.twisted.turns,
                projectionParams.segments.twisted.tubes
            );
        default:
            console.warn('Unknown projection mode:', projectionParams.mode);
            return new THREE.TorusKnotGeometry(10, 3, 100, 16);
    }
}

/*──────────────────────────────────────────────────────────────
  PROJECTION HANDLING
──────────────────────────────────────────────────────────────*/
export function project(originalMesh) {
    if (!projectionParams.enabled) {
        return originalMesh;
    }

    cleanup();

    // Temporarily add original mesh to scene and render to texture
    scene.add(originalMesh);
    
    // Create and setup render target
    const size = new THREE.Vector2();
    renderer.getSize(size);
    renderTarget = new THREE.WebGLRenderTarget(size.x * 2, size.y * 2, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    });

    // Store current scene state
    const currentBackground = scene.background;
    
    // Render to texture
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    
    // Restore scene state
    scene.background = currentBackground;

    // Remove original mesh
    scene.remove(originalMesh);
    
    // Create projection geometry
    const geometry = createProjectionGeometry();
    geometry.scale(
        projectionParams.scale,
        projectionParams.scale,
        projectionParams.scale
    );

    // Create material with captured texture
    const material = new THREE.MeshBasicMaterial({
        map: renderTarget.texture,
        side: THREE.DoubleSide
    });

    // Create and add projection mesh
    currentProjection = new THREE.Mesh(geometry, material);
    currentProjection.rotation.set(
        projectionParams.rotation.x,
        projectionParams.rotation.y,
        projectionParams.rotation.z
    );

    scene.add(currentProjection);
    return currentProjection;
}

/*──────────────────────────────────────────────────────────────
  PARAMETER UPDATES
──────────────────────────────────────────────────────────────*/
export function updateScale(value) {
    projectionParams.scale = value;
    if (currentProjection) {
        currentProjection.scale.setScalar(value);
    }
}

export function updateRotation(axis, value) {
    projectionParams.rotation[axis] = value;
    if (currentProjection) {
        currentProjection.rotation[axis] = value;
    }
}

export function getCurrentProjection() {
    return currentProjection;
}

/*──────────────────────────────────────────────────────────────
  MODE AND SEGMENT UPDATES
──────────────────────────────────────────────────────────────*/
export function updateProjectionMode(mode) {
    projectionParams.mode = mode;
    if (projectionParams.enabled) {
        createText(); // This will trigger a new projection with the updated mode
    }
}

export function updateSegments(type, value) {
    if (projectionParams.segments[projectionParams.mode] && 
        projectionParams.segments[projectionParams.mode][type] !== undefined) {
        projectionParams.segments[projectionParams.mode][type] = value;
        if (projectionParams.enabled) {
            createText();
        }
    }
}