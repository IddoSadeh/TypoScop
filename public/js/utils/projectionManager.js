// projectionManager.js
import * as THREE from 'three';
import { projectionParams } from '../parameters/projectionParams.js';

export class ProjectionManager {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.currentProjection = null;
        this.renderTarget = null;
    }

    disposeMesh(mesh) {
        if (!mesh) return;
        
        this.scene.remove(mesh);
        
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

    cleanup() {
        if (this.currentProjection) {
            this.disposeMesh(this.currentProjection);
            this.currentProjection = null;
        }
        if (this.renderTarget) {
            this.renderTarget.dispose();
            this.renderTarget = null;
        }
    }

    createProjectionGeometry() {
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

    project(originalMesh) {
        if (!projectionParams.enabled) {
            return originalMesh;
        }

        this.cleanup();

        // Temporarily add original mesh to scene and render to texture
        this.scene.add(originalMesh);
        
        // Create and setup render target
        const size = new THREE.Vector2();
        this.renderer.getSize(size);
        this.renderTarget = new THREE.WebGLRenderTarget(size.x * 2, size.y * 2, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });

        // Store current scene state
        const currentBackground = this.scene.background;
        
        // Render to texture
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
        
        // Restore scene state
        this.scene.background = currentBackground;

        // Remove original mesh
        this.scene.remove(originalMesh);
        
        // Create projection geometry
        const geometry = this.createProjectionGeometry();
        geometry.scale(
            projectionParams.scale,
            projectionParams.scale,
            projectionParams.scale
        );

        // Create material with captured texture
        const material = new THREE.MeshBasicMaterial({
            map: this.renderTarget.texture,
            side: THREE.DoubleSide
        });

        // Create and add projection mesh
        this.currentProjection = new THREE.Mesh(geometry, material);
        this.currentProjection.rotation.set(
            projectionParams.rotation.x,
            projectionParams.rotation.y,
            projectionParams.rotation.z
        );

        this.scene.add(this.currentProjection);
        return this.currentProjection;
    }

    updateScale(value) {
        projectionParams.scale = value;
        if (this.currentProjection) {
            this.currentProjection.scale.setScalar(value);
        }
    }

    updateRotation(axis, value) {
        projectionParams.rotation[axis] = value;
        if (this.currentProjection) {
            this.currentProjection.rotation[axis] = value;
        }
    }
}