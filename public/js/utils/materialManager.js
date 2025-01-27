// materialManager.js
import * as THREE from 'three';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { materialParams } from '../parameters/materialParams.js';

// Shared vertex shader for both materials
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

function createTessellatedGeometry(geometry) {
    try {
        // Clone the geometry and ensure it's valid
        const tessellatedGeometry = geometry.clone();
        if (!tessellatedGeometry.attributes.position) {
            throw new Error('No position attribute in geometry');
        }

        // Apply tessellation with safe default values
        const tessellateModifier = new TessellateModifier(
            Math.max(1, materialParams.tessellationSegments || 8),
            6
        );
        tessellateModifier.modify(tessellatedGeometry);

        // Calculate faces and create arrays
        const numFaces = tessellatedGeometry.attributes.position.count / 3;
        const colors = new Float32Array(numFaces * 3 * 3);
        const displacement = new Float32Array(numFaces * 3 * 3);
        
        // Initialize color
        const color = new THREE.Color();
        const baseColor = new THREE.Color(materialParams.color || '#ffffff');
        const baseHSL = {};
        baseColor.getHSL(baseHSL);

        // Initialize arrays with safe values
        for (let f = 0; f < numFaces; f++) {
            const index = 9 * f;
            let h, s, l;
            
            // Calculate color based on pattern with safe defaults
            switch (materialParams.colorPattern || 'random') {
                case 'gradient':
                    const progress = f / numFaces;
                    h = baseHSL.h + (materialParams.colorHueRange || 0.2) * progress;
                    s = baseHSL.s + (materialParams.colorSatRange || 0.5) * progress;
                    l = baseHSL.l + (materialParams.colorLightRange || 0.3) * progress;
                    break;
                case 'waves':
                    const wave = Math.sin(f * 0.1);
                    h = baseHSL.h + (materialParams.colorHueRange || 0.2) * wave * 0.5;
                    s = baseHSL.s + (materialParams.colorSatRange || 0.5) * wave * 0.5;
                    l = baseHSL.l + (materialParams.colorLightRange || 0.3) * wave * 0.5;
                    break;
                default: // random
                    h = baseHSL.h + (Math.random() - 0.5) * (materialParams.colorHueRange || 0.2);
                    s = baseHSL.s + (Math.random() - 0.5) * (materialParams.colorSatRange || 0.5);
                    l = baseHSL.l + (Math.random() - 0.5) * (materialParams.colorLightRange || 0.3);
                    break;
            }

            // Ensure color values are in valid range
            h = ((h % 1) + 1) % 1;
            s = Math.max(0, Math.min(1, s));
            l = Math.max(0, Math.min(1, l));

            color.setHSL(h, s, l);
            const d = 10 * (0.5 - Math.random());

            // Set colors and displacement for each vertex of the face
            for (let i = 0; i < 3; i++) {
                colors[index + (3 * i)] = color.r;
                colors[index + (3 * i) + 1] = color.g;
                colors[index + (3 * i) + 2] = color.b;

                displacement[index + (3 * i)] = d;
                displacement[index + (3 * i) + 1] = d;
                displacement[index + (3 * i) + 2] = d;
            }
        }

        // Add attributes to geometry
        tessellatedGeometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        tessellatedGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));

        // Ensure geometry is properly set up for rendering
        tessellatedGeometry.computeVertexNormals();
        tessellatedGeometry.computeBoundingSphere();

        return tessellatedGeometry;
    } catch (error) {
        console.error('Error creating tessellated geometry:', error);
        // Return original geometry as fallback
        return geometry.clone();
    }
}


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

        // Initialize arrays
        for (let i = 0; i < count; i++) {
            displacement[i * 3] = (Math.random() - 0.5) * 3;
            displacement[i * 3 + 1] = (Math.random() - 0.5) * 3;
            displacement[i * 3 + 2] = (Math.random() - 0.5) * 3;

            const progress = i / count;
            const h = baseHSL.h + (Math.random() - 0.5) * (materialParams.colorHueRange || 0.2);
            const s = baseHSL.s + (Math.random() - 0.5) * (materialParams.colorSatRange || 0.5);
            const l = baseHSL.l + (Math.random() - 0.5) * (materialParams.colorLightRange || 0.3);
            color.setHSL(h, s, l);
            color.toArray(colors, i * 3);
        }

        geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.ShaderMaterial({
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

        return material;
    } catch (error) {
        console.error('Error creating wireframe material:', error);
        // Return a basic wireframe material as fallback
        return new THREE.MeshBasicMaterial({
            color: materialParams.color || '#ffffff',
            wireframe: true
        });
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
            // Add these properties to ensure proper rendering
            transparent: false,
            side: THREE.DoubleSide,
            vertexColors: true
        });
    } catch (error) {
        console.error('Error creating shader material:', error);
        // Return a basic material as fallback
        return new THREE.MeshStandardMaterial({
            color: materialParams.color || '#ffffff',
            metalness: materialParams.metalness || 0,
            roughness: materialParams.roughness || 0.5
        });
    }
}

function sampleGeometryPoints(geometry, density) {
    const positions = [];
    const positionAttribute = geometry.attributes.position;
    const faces = positionAttribute.count / 3;

    // Adjust the density factor to be more reasonable
    const densityFactor = 300; // Reduced from 1000 but still maintains good visual quality

    for (let face = 0; face < faces; face++) {
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        const c = new THREE.Vector3();
        
        for (let i = 0; i < 3; i++) {
            const baseIndex = face * 9 + i * 3;
            const vertex = i === 0 ? a : (i === 1 ? b : c);
            vertex.set(
                positionAttribute.array[baseIndex],
                positionAttribute.array[baseIndex + 1],
                positionAttribute.array[baseIndex + 2]
            );
        }
        
        const area = getTriangleArea(a, b, c);
        const numPoints = Math.ceil(area * density * densityFactor);
        
        for (let i = 0; i < numPoints; i++) {
            const point = getRandomPointInTriangle(a, b, c);
            positions.push(point);
        }
    }
    
    return positions;
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

function createParticleMaterial(geometry) {
    try {
        const textureCoordinates = sampleGeometryPoints(geometry, materialParams.particleDensity);
        
        let particleGeometry;
        const size = materialParams.particleSize * 1.5;
        switch (materialParams.particleShape) {
            case 'cube':
                particleGeometry = new THREE.BoxGeometry(
                    size,
                    size,
                    size
                );
                break;
            case 'torus':
                particleGeometry = new THREE.TorusGeometry(
                    size,
                    size * 0.5,
                    8,
                    16
                );
                break;
            default: // sphere
                particleGeometry = new THREE.SphereGeometry(
                    size,
                    8, // Slightly increased segments for better quality
                    8
                );
        }

        // Create array for colors
        const colors = new Float32Array(textureCoordinates.length * 3);
        const baseColor = new THREE.Color(materialParams.color || '#ffffff');
        const baseHSL = {};
        baseColor.getHSL(baseHSL);
        const color = new THREE.Color();

        // Apply color pattern
        for(let i = 0; i < textureCoordinates.length; i++) {
            let h, s, l;
            const progress = i / textureCoordinates.length;
            
            switch (materialParams.colorPattern || 'random') {
                case 'gradient':
                    h = baseHSL.h + ((materialParams.colorHueRange || 0.2) * progress);
                    s = baseHSL.s + ((materialParams.colorSatRange || 0.5) * progress);
                    l = baseHSL.l + ((materialParams.colorLightRange || 0.3) * progress);
                    break;
                case 'waves':
                    const wave = Math.sin(progress * Math.PI * 2);
                    h = baseHSL.h + ((materialParams.colorHueRange || 0.2) * wave * 0.5);
                    s = baseHSL.s + ((materialParams.colorSatRange || 0.5) * wave * 0.5);
                    l = baseHSL.l + ((materialParams.colorLightRange || 0.3) * wave * 0.5);
                    break;
                default: // random
                    h = baseHSL.h + (Math.random() - 0.5) * (materialParams.colorHueRange || 0.2);
                    s = baseHSL.s + (Math.random() - 0.5) * (materialParams.colorSatRange || 0.5);
                    l = baseHSL.l + (Math.random() - 0.5) * (materialParams.colorLightRange || 0.3);
            }
            
            h = ((h % 1) + 1) % 1;
            s = Math.max(0, Math.min(1, s));
            l = Math.max(0, Math.min(1, l));
            
            color.setHSL(h, s, l);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        // Create instanced mesh with colors
        const particleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            vertexColors: true,
            metalness: materialParams.metalness || 0,
            roughness: materialParams.roughness || 0.5,
            emissive: new THREE.Color(0x222222)
        });

        const instancedMesh = new THREE.InstancedMesh(
            particleGeometry,
            particleMaterial,
            textureCoordinates.length
        );

        const dummy = new THREE.Object3D();
        const scale = materialParams.particleScale || 1.0;

        // Set initial positions and store original positions for animation
        textureCoordinates.forEach((point, i) => {
            dummy.position.set(
                point.x,
                point.y,
                point.z
            );
            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
            // Set color for this instance
            instancedMesh.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
        instancedMesh.userData.originalPositions = textureCoordinates;

        return {
            geometry: geometry,
            material: particleMaterial,
            mesh: instancedMesh
        };
    } catch (error) {
        console.error('Error creating particle material:', error);
        // Return a basic material as fallback
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

export function createMaterial(geometry) {
    // Ensure we have a valid geometry
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
        // Fallback to standard material if something goes wrong
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
        mesh.material.uniforms.amplitude.value = 
            materialParams.manipulationAnimationIntensity * Math.sin(time);
    } else {
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
    const positions = mesh.userData.originalPositions;
    const intensity = materialParams.manipulationAnimationIntensity;
    const speed = materialParams.manipulationAnimationSpeed;

    positions.forEach((pos, i) => {
        // Calculate direction from center (0,0,0) to particle
        const dirX = pos.x;
        const dirY = pos.y;
        const dirZ = pos.z;
        
        // Normalize direction
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        const normX = dirX / length;
        const normY = dirY / length;
        const normZ = dirZ / length;

        // Create exploded position using normalized direction
        const explosionFactor = Math.sin(time * speed) * intensity;
        dummy.position.set(
            pos.x + normX * explosionFactor,
            pos.y + normY * explosionFactor,
            pos.z + normZ * explosionFactor
        );

        // Add some rotation for more interesting movement
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