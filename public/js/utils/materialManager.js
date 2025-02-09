// materialManager.js
import * as THREE from 'three';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { materialParams } from '../parameters/materialParams.js';

//
// ─── SHADERS ────────────────────────────────────────────────────────────────
//

// Shared vertex shader (used for tessellation & wireframe)
const vertexShader = `
    uniform float amplitude;
    attribute vec3 customColor;
    attribute vec3 displacement;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vColor = customColor;
        vNormal = normal;
        vec3 newPosition = position + normal * amplitude * displacement;
        vPosition = newPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

// Fragment shader for tessellation
const tessellationFragmentShader = `
    uniform float metalness;
    uniform float roughness;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec3 light = normalize(vec3(5.0, 5.0, 10.0));
        vec3 viewDir = normalize(-vPosition);
        
        float ambientStrength = 0.3;
        vec3 ambient = ambientStrength * vColor;
        
        float diff = max(dot(vNormal, light), 0.0);
        vec3 diffuse = diff * vColor;
        
        vec3 reflectDir = reflect(-light, vNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        float specularStrength = metalness * (1.0 - roughness);
        vec3 specular = specularStrength * spec * vec3(1.0);
        
        vec3 finalColor = ambient + diffuse + specular;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Fragment shader for wireframe
const wireframeFragmentShader = `
    uniform float opacity;
    uniform vec3 baseColor;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec3 light = normalize(vec3(5.0, 5.0, 10.0));
        float diffuse = max(dot(vNormal, light), 0.0);
        float ambient = 0.3;
        float brightness = ambient + diffuse;
        vec3 finalColor = mix(vColor, baseColor, 0.5) * brightness;
        float glowFactor = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), 2.0);
        finalColor += glowFactor * 0.5;
        gl_FragColor = vec4(finalColor, opacity);
    }
`;

//
// ─── TESSELLATION MATERIAL ─────────────────────────────────────────────────────
//

function createTessellatedGeometry(geometry) {
    try {
        // Clone the geometry and ensure it is valid.
        const tessellatedGeometry = geometry.clone();
        if (!tessellatedGeometry.attributes.position) {
            throw new Error('No position attribute in geometry');
        }

        // Apply tessellation using TessellateModifier.
        const tessellateModifier = new TessellateModifier(
            Math.max(1, materialParams.tessellationSegments || 8),
            6
        );
        tessellateModifier.modify(tessellatedGeometry);

        // Create per-face color and displacement arrays.
        const numFaces = tessellatedGeometry.attributes.position.count / 3;
        const colors = new Float32Array(numFaces * 3 * 3);
        const displacement = new Float32Array(numFaces * 3 * 3);
        const color = new THREE.Color();
        const baseColor = new THREE.Color(materialParams.color || '#ffffff');
        const baseHSL = {};
        baseColor.getHSL(baseHSL);

        for (let f = 0; f < numFaces; f++) {
            const index = 9 * f;
            let h, s, l;
            switch (materialParams.colorPattern || 'random') {
                case 'gradient': {
                    const progress = f / numFaces;
                    h = baseHSL.h + (materialParams.colorHueRange || 0.2) * progress;
                    s = baseHSL.s + (materialParams.colorSatRange || 0.5) * progress;
                    l = baseHSL.l + (materialParams.colorLightRange || 0.3) * progress;
                    break;
                }
                case 'waves': {
                    const wave = Math.sin(f * 0.1);
                    h = baseHSL.h + (materialParams.colorHueRange || 0.2) * wave * 0.5;
                    s = baseHSL.s + (materialParams.colorSatRange || 0.5) * wave * 0.5;
                    l = baseHSL.l + (materialParams.colorLightRange || 0.3) * wave * 0.5;
                    break;
                }
                default: { // random
                    h = baseHSL.h + (Math.random() - 0.5) * (materialParams.colorHueRange || 0.2);
                    s = baseHSL.s + (Math.random() - 0.5) * (materialParams.colorSatRange || 0.5);
                    l = baseHSL.l + (Math.random() - 0.5) * (materialParams.colorLightRange || 0.3);
                    break;
                }
            }
            // Clamp and wrap values.
            h = ((h % 1) + 1) % 1;
            s = Math.max(0, Math.min(1, s));
            l = Math.max(0, Math.min(1, l));
            color.setHSL(h, s, l);
            const d = 10 * (0.5 - Math.random());
            for (let i = 0; i < 3; i++) {
                colors[index + (3 * i)]     = color.r;
                colors[index + (3 * i) + 1] = color.g;
                colors[index + (3 * i) + 2] = color.b;

                displacement[index + (3 * i)]     = d;
                displacement[index + (3 * i) + 1] = d;
                displacement[index + (3 * i) + 2] = d;
            }
        }

        tessellatedGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        tessellatedGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));
        tessellatedGeometry.computeVertexNormals();
        tessellatedGeometry.computeBoundingSphere();

        return tessellatedGeometry;
    } catch (error) {
        console.error('Error creating tessellated geometry:', error);
        return geometry.clone();
    }
}

function createShaderMaterial() {
    try {
        return new THREE.ShaderMaterial({
            uniforms: {
                amplitude: { value: 0.0 },
                metalness: { value: materialParams.metalness || 0 },
                roughness: { value: materialParams.roughness || 0.5 }
            },
            vertexShader,
            fragmentShader: tessellationFragmentShader,
            wireframe: false,
            transparent: false,
            side: THREE.DoubleSide,
            vertexColors: true
        });
    } catch (error) {
        console.error('Error creating shader material:', error);
        return new THREE.MeshStandardMaterial({
            color: materialParams.color || '#ffffff',
            metalness: materialParams.metalness || 0,
            roughness: materialParams.roughness || 0.5
        });
    }
}

//
// ─── WIREFRAME MATERIAL ─────────────────────────────────────────────────────────
//

function createWireframeMaterial(geometry) {
    try {
        const positions = geometry.attributes.position;
        if (!positions) throw new Error('No position attribute in geometry');

        const count = positions.count;
        const displacement = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();
        const baseColor = new THREE.Color(materialParams.color || '#ffffff');
        const baseHSL = {};
        baseColor.getHSL(baseHSL);

        for (let i = 0; i < count; i++) {
            displacement[i * 3]     = (Math.random() - 0.5) * 3;
            displacement[i * 3 + 1] = (Math.random() - 0.5) * 3;
            displacement[i * 3 + 2] = (Math.random() - 0.5) * 3;

            const h = baseHSL.h + (Math.random() - 0.5) * (materialParams.colorHueRange || 0.2);
            const s = baseHSL.s + (Math.random() - 0.5) * (materialParams.colorSatRange || 0.5);
            const l = baseHSL.l + (Math.random() - 0.5) * (materialParams.colorLightRange || 0.3);
            color.setHSL(((h % 1) + 1) % 1, Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, l)));
            color.toArray(colors, i * 3);
        }

        geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

        return new THREE.ShaderMaterial({
            uniforms: {
                amplitude: { value: 0.0 },
                opacity: { value: materialParams.wireframeOpacity || 0.8 },
                baseColor: { value: new THREE.Color(materialParams.color || '#ffffff') }
            },
            vertexShader,
            fragmentShader: wireframeFragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            wireframe: true
        });
    } catch (error) {
        console.error('Error creating wireframe material:', error);
        return new THREE.MeshBasicMaterial({
            color: materialParams.color || '#ffffff',
            wireframe: true
        });
    }
}

//
// ─── PARTICLE MATERIAL (CPU‑DRIVEN Animation) ─────────────────────────────────
//

function createParticleMaterial(geometry) {
    try {
        // Get an array of sample objects ({ position, normal }).
        const textureSamples = sampleGeometryPoints(geometry, materialParams.particleDensity);
        const instanceCount = textureSamples.length;

        // Create the particle geometry based on the selected shape.
        let particleGeometry;
        const size = materialParams.particleSize * 1.5;
        switch (materialParams.particleShape) {
            case 'cube':
                particleGeometry = new THREE.BoxGeometry(size, size, size);
                break;
            case 'torus':
                particleGeometry = new THREE.TorusGeometry(size, size * 0.5, 8, 16);
                break;
            default: // sphere
                particleGeometry = new THREE.SphereGeometry(size, 8, 8);
        }

        // Prepare an array for instance colors.
        const colorsArray = new Float32Array(instanceCount * 3);
        const baseColor = new THREE.Color(materialParams.color || '#ffffff');
        const baseHSL = {};
        baseColor.getHSL(baseHSL);
        const tempColor = new THREE.Color();

        for (let i = 0; i < instanceCount; i++) {
            let h, s, l;
            const progress = i / instanceCount;
            if (materialParams.colorPattern === 'gradient') {
                h = baseHSL.h + ((materialParams.colorHueRange || 0.2) * progress);
                s = baseHSL.s + ((materialParams.colorSatRange || 0.5) * progress);
                l = baseHSL.l + ((materialParams.colorLightRange || 0.3) * progress);
            } else if (materialParams.colorPattern === 'waves') {
                const wave = Math.sin(progress * Math.PI * 2);
                h = baseHSL.h + ((materialParams.colorHueRange || 0.2) * wave * 0.5);
                s = baseHSL.s + ((materialParams.colorSatRange || 0.5) * wave * 0.5);
                l = baseHSL.l + ((materialParams.colorLightRange || 0.3) * wave * 0.5);
            } else { // random
                h = baseHSL.h + (Math.random() - 0.5) * (materialParams.colorHueRange || 0.2);
                s = baseHSL.s + (Math.random() - 0.5) * (materialParams.colorSatRange || 0.5);
                l = baseHSL.l + (Math.random() - 0.5) * (materialParams.colorLightRange || 0.3);
            }
            h = ((h % 1) + 1) % 1;
            s = Math.max(0, Math.min(1, s));
            l = Math.max(0, Math.min(1, l));
            tempColor.setHSL(h, s, l);
            colorsArray.set([tempColor.r, tempColor.g, tempColor.b], i * 3);
        }

        // Create the particle material.
        const particleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            vertexColors: true,
            metalness: materialParams.metalness || 0,
            roughness: materialParams.roughness || 0.5,
            emissive: new THREE.Color(materialParams.emissiveColor || 0x222222)
        });

        // Modify the shader to pass instance colors.
        particleMaterial.onBeforeCompile = (shader) => {
            shader.vertexShader = 'varying vec3 vInstanceColor;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
    vInstanceColor = instanceColor;`
            );
            shader.fragmentShader = 'varying vec3 vInstanceColor;\n' + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `#include <dithering_fragment>
    gl_FragColor.rgb *= vInstanceColor;`
            );
        };

        // Create the instanced mesh.
        const instancedMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, instanceCount);

        // Ensure instanceColor attribute exists.
        if (!instancedMesh.instanceColor) {
            instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3);
        }

        // Set per-instance transformation matrices and colors.
        const dummy = new THREE.Object3D();
        const scale = materialParams.particleScale || 1.0;
        for (let i = 0; i < instanceCount; i++) {
            const sample = textureSamples[i];
            const point = sample.position;
            dummy.position.set(point.x, point.y, point.z);
            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
            // Set per-instance color.
            instancedMesh.setColorAt(i, new THREE.Color(
                colorsArray[i * 3],
                colorsArray[i * 3 + 1],
                colorsArray[i * 3 + 2]
            ));
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.instanceColor.needsUpdate = true;
        // Store the original samples for CPU-based animation.
        instancedMesh.userData.originalPositions = textureSamples;

        return {
            geometry: geometry,
            material: particleMaterial,
            mesh: instancedMesh
        };
    } catch (error) {
        console.error('Error creating particle material:', error);
        return {
            geometry: geometry,
            material: new THREE.MeshStandardMaterial({
                color: materialParams.color || '#ffffff',
                metalness: materialParams.metalness || 0,
                roughness: materialParams.roughness || 0.5
            })
        };
    }
}

//
// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
//

function sampleGeometryPoints(geometry, density) {
    const samples = [];
    const positionAttribute = geometry.attributes.position;
    const faces = positionAttribute.count / 3;
    const densityFactor = 5; // Adjust density factor as needed

    for (let face = 0; face < faces; face++) {
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        const c = new THREE.Vector3();
        for (let i = 0; i < 3; i++) {
            const baseIndex = face * 9 + i * 3;
            const vertex = (i === 0) ? a : (i === 1 ? b : c);
            vertex.set(
                positionAttribute.array[baseIndex],
                positionAttribute.array[baseIndex + 1],
                positionAttribute.array[baseIndex + 2]
            );
        }
        const normal = new THREE.Vector3();
        normal.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();
        const area = getTriangleArea(a, b, c);
        const numPoints = Math.ceil(area * density * densityFactor);
        for (let i = 0; i < numPoints; i++) {
            const point = getRandomPointInTriangle(a, b, c);
            samples.push({
                position: point,
                normal: { x: normal.x, y: normal.y, z: normal.z }
            });
        }
    }
    return samples;
}

function getTriangleArea(a, b, c) {
    const ab = new THREE.Vector3().subVectors(b, a);
    const ac = new THREE.Vector3().subVectors(c, a);
    const cross = new THREE.Vector3().crossVectors(ab, ac);
    return cross.length() * 0.5;
}

function getRandomPointInTriangle(a, b, c) {
    const r1 = Math.random();
    const r2 = Math.random();
    const sqrtr1 = Math.sqrt(r1);
    const u = 1 - sqrtr1;
    const v = r2 * sqrtr1;
    const w = 1 - u - v;
    return {
        x: a.x * u + b.x * v + c.x * w,
        y: a.y * u + b.y * v + c.y * w,
        z: a.z * u + b.z * v + c.z * w
    };
}

//
// ─── EXPORTED FUNCTIONS ─────────────────────────────────────────────────────────
//

export function createMaterial(geometry) {
    if (!geometry) return null;
    try {
        if (materialParams.particlesEnabled) {
            return createParticleMaterial(geometry);
        } else if (materialParams.wireframeEnabled) {
            return {
                geometry: geometry,
                material: createWireframeMaterial(geometry)
            };
        } else if (materialParams.tessellationEnabled) {
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
    } catch (error) {
        console.error('Error creating material:', error);
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

export function updateMaterialUniforms(mesh) {
    if (!mesh || !mesh.material || !mesh.material.uniforms) return;

    if (materialParams.manipulationAnimationEnabled) {
        const currentTime = Date.now() * 0.001;
        const time = currentTime * materialParams.manipulationAnimationSpeed;
        if (mesh.material.uniforms.amplitude) {
            mesh.material.uniforms.amplitude.value = materialParams.manipulationAnimationIntensity * Math.sin(time);
        }
    } else if (mesh.material.uniforms.amplitude) {
        mesh.material.uniforms.amplitude.value = 0;
    }

    if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
        if (mesh.material.uniforms.metalness) {
            mesh.material.uniforms.metalness.value = materialParams.metalness;
        }
        if (mesh.material.uniforms.roughness) {
            mesh.material.uniforms.roughness.value = materialParams.roughness;
        }
    }

    if (materialParams.wireframeEnabled) {
        if (mesh.material.uniforms.opacity) {
            mesh.material.uniforms.opacity.value = materialParams.wireframeOpacity;
        }
        if (mesh.material.uniforms.baseColor) {
            mesh.material.uniforms.baseColor.value.set(materialParams.color);
        }
    }
}

export function updateParticleAnimation(mesh, time) {
    if (!mesh || !mesh.isInstancedMesh) return;

    const dummy = new THREE.Object3D();
    const samples = mesh.userData.originalPositions; // Array of { position, normal }
    const intensity = materialParams.manipulationAnimationIntensity;
    const speed = materialParams.manipulationAnimationSpeed;

    samples.forEach((sample, i) => {
        const pos = sample.position;
        const norm = sample.normal;
        const explosionFactor = Math.sin(time * speed) * intensity;
        dummy.position.set(
            pos.x + norm.x * explosionFactor,
            pos.y + norm.y * explosionFactor,
            pos.z + norm.z * explosionFactor
        );
        dummy.rotation.set(
            time * speed * 0.5,
            time * speed * 0.3,
            time * speed * 0.4
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
}
