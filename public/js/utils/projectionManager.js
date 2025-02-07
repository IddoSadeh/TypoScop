// projectionManager.js
import * as THREE from 'three';
import { projectionParams } from '../parameters/projectionParams.js';
import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
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
    const segments = projectionParams.segments;
    
    switch (projectionParams.mode) {
        case 'torusknot':
            return new THREE.TorusKnotGeometry(
                10, 3,
                segments.torusknot.turns,
                segments.torusknot.tubes
            );
            
        case 'cube':
            return new THREE.BoxGeometry(10, 10, 10);
            
        case 'sphere':
            return new THREE.SphereGeometry(
                7,
                segments.sphere.width,
                segments.sphere.height
            );
            
        case 'donut':
            return new THREE.TorusGeometry(
                segments.donut.radius,
                segments.donut.tube,
                segments.donut.radialSegments,
                segments.donut.tubularSegments
            );
            
        case 'cylinder':
            return new THREE.CylinderGeometry(
                segments.cylinder.radiusTop,
                segments.cylinder.radiusBottom,
                segments.cylinder.height,
                segments.cylinder.segments
            );
            
        case 'cone':
            return new THREE.ConeGeometry(
                segments.cone.radius,
                segments.cone.height,
                segments.cone.segments
            );
            
        case 'octahedron':
            return new THREE.OctahedronGeometry(segments.octahedron.radius);
            
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

    if (projectionParams.projectionType === 'pattern') {
        const geometry = createProjectionGeometry();
        geometry.scale(
            projectionParams.scale,
            projectionParams.scale,
            projectionParams.scale
        );

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Set background
        ctx.fillStyle = projectionParams.pattern.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Setup text parameters
        const fontSize = Math.floor(canvas.height * 0.2);
        ctx.fillStyle = projectionParams.pattern.textColor;
        ctx.font = `${fontSize}px ${textParams.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Apply letter and word spacing
        const text = textParams.text.split('').join('\u200B'.repeat(
            Math.floor(projectionParams.pattern.letterSpacing * 5)
        ));
        const words = text.split(' ').join(' '.repeat(
            Math.floor(projectionParams.pattern.wordSpacing * 5)
        ));
        
        // Draw text
        ctx.fillText(words, canvas.width/2, canvas.height/2);

        // Create texture
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(
            projectionParams.pattern.repeatX,
            projectionParams.pattern.repeatY
        );

        // Create material
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: projectionParams.pattern.opacity,
            color: projectionParams.pattern.objectColor
        });

        // Create mesh
        currentProjection = new THREE.Mesh(geometry, material);
        currentProjection.rotation.set(
            projectionParams.rotation.x,
            projectionParams.rotation.y,
            projectionParams.rotation.z
        );

        // Setup animation
        function animate() {
            if (!projectionParams.pattern.animatePattern) return;
            
            requestAnimationFrame(animate);
            const speed = projectionParams.pattern.animationSpeed * 
                         (projectionParams.pattern.animationReverse ? -1 : 1);

            switch(projectionParams.pattern.animationDirection) {
                case 'vertical':
                    texture.offset.y -= speed;
                    break;
                case 'horizontal':
                    texture.offset.x -= speed;
                    break;
                case 'diagonal':
                    texture.offset.x -= speed;
                    texture.offset.y -= speed;
                    break;
            }
        }
        animate();

        scene.add(currentProjection);
        return currentProjection;
    }else {
        // Standard projection - keep exactly as before
        scene.add(originalMesh);
        
        const size = new THREE.Vector2();
        renderer.getSize(size);
        renderTarget = new THREE.WebGLRenderTarget(size.x * 2, size.y * 2, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });

        const currentBackground = scene.background;
        
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        
        scene.background = currentBackground;

        scene.remove(originalMesh);
        
        const geometry = createProjectionGeometry();
        geometry.scale(
            projectionParams.scale,
            projectionParams.scale,
            projectionParams.scale
        );

        const material = new THREE.MeshBasicMaterial({
            map: renderTarget.texture,
            side: THREE.DoubleSide
        });

        currentProjection = new THREE.Mesh(geometry, material);
        currentProjection.rotation.set(
            projectionParams.rotation.x,
            projectionParams.rotation.y,
            projectionParams.rotation.z
        );

        scene.add(currentProjection);
        return currentProjection;
    }
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