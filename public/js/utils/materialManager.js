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
    const tessellatedGeometry = geometry.clone();
    const tessellateModifier = new TessellateModifier(materialParams.tessellationSegments, 6);
    tessellateModifier.modify(tessellatedGeometry);

    const numFaces = tessellatedGeometry.attributes.position.count / 3;
    const colors = new Float32Array(numFaces * 3 * 3);
    const displacement = new Float32Array(numFaces * 3 * 3);
    const color = new THREE.Color();
    const baseColor = new THREE.Color(materialParams.color);
    const baseHSL = {};
    baseColor.getHSL(baseHSL);

    for (let f = 0; f < numFaces; f++) {
        const index = 9 * f;
        let h, s, l;
        
        switch (materialParams.colorPattern) {
            case 'gradient':
                const progress = f / numFaces;
                h = baseHSL.h + (materialParams.colorHueRange * progress);
                s = baseHSL.s + (materialParams.colorSatRange * progress);
                l = baseHSL.l + (materialParams.colorLightRange * progress);
                break;
            case 'waves':
                const wave = Math.sin(f * 0.1);
                h = baseHSL.h + (materialParams.colorHueRange * wave * 0.5);
                s = baseHSL.s + (materialParams.colorSatRange * wave * 0.5);
                l = baseHSL.l + (materialParams.colorLightRange * wave * 0.5);
                break;
            default: // random
                h = baseHSL.h + (Math.random() - 0.5) * materialParams.colorHueRange;
                s = baseHSL.s + (Math.random() - 0.5) * materialParams.colorSatRange;
                l = baseHSL.l + (Math.random() - 0.5) * materialParams.colorLightRange;
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

function createWireframeMaterial(geometry) {
    const positions = geometry.attributes.position;
    const count = positions.count;
    const displacement = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    const baseColor = new THREE.Color(materialParams.color);
    const baseHSL = {};
    baseColor.getHSL(baseHSL);

    for (let i = 0; i < count; i++) {
        displacement[i * 3] = (Math.random() - 0.5) * 3;
        displacement[i * 3 + 1] = (Math.random() - 0.5) * 3;
        displacement[i * 3 + 2] = (Math.random() - 0.5) * 3;

        const progress = i / count;
        const h = baseHSL.h + (Math.random() - 0.5) * materialParams.colorHueRange;
        const s = baseHSL.s + (Math.random() - 0.5) * materialParams.colorSatRange;
        const l = baseHSL.l + (Math.random() - 0.5) * materialParams.colorLightRange;
        color.setHSL(h, s, l);
        color.toArray(colors, i * 3);
    }

    geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

    return new THREE.ShaderMaterial({
        uniforms: {
            amplitude: { value: 0.0 },
            opacity: { value: materialParams.wireframeOpacity },
            baseColor: { value: new THREE.Color(materialParams.color) }
        },
        vertexShader,
        fragmentShader: wireframeFragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        wireframe: true
    });
}

function createShaderMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            amplitude: { value: 0.0 },
            metalness: { value: materialParams.metalness },
            roughness: { value: materialParams.roughness }
        },
        vertexShader,
        fragmentShader: tessellationFragmentShader,
        wireframe: false
    });
}

function sampleGeometryPoints(geometry, density) {
    const positions = [];
    const positionAttribute = geometry.attributes.position;
    const faces = positionAttribute.count / 3;
    
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
        const numPoints = Math.ceil(area * density * 1000);
        
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
    const textureCoordinates = sampleGeometryPoints(geometry, materialParams.particleDensity);
    
    let particleGeometry;
    switch (materialParams.particleShape) {
        case 'cube':
            particleGeometry = new THREE.BoxGeometry(
                materialParams.particleSize,
                materialParams.particleSize,
                materialParams.particleSize
            );
            break;
        case 'torus':
            particleGeometry = new THREE.TorusGeometry(
                materialParams.particleSize,
                materialParams.particleSize * 0.5,
                16,
                32
            );
            break;
        default: // sphere
            particleGeometry = new THREE.SphereGeometry(
                materialParams.particleSize,
                8,
                8
            );
    }

    const particleMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(materialParams.color),
        metalness: materialParams.metalness,
        roughness: materialParams.roughness
    });

    const instancedMesh = new THREE.InstancedMesh(
        particleGeometry,
        particleMaterial,
        textureCoordinates.length
    );

    const dummy = new THREE.Object3D();
    const scale = materialParams.particleScale;

    textureCoordinates.forEach((point, i) => {
        const randomOffset = materialParams.particleRandomness;
        const rx = (Math.random() - 0.5) * randomOffset;
        const ry = (Math.random() - 0.5) * randomOffset;
        const rz = (Math.random() - 0.5) * randomOffset;

        dummy.position.set(
            point.x + rx,
            point.y + ry,
            point.z + rz
        );

        dummy.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.userData.originalPositions = textureCoordinates;

    return {
        geometry: geometry,
        material: particleMaterial,
        mesh: instancedMesh
    };
}

export function createMaterial(geometry) {
    if (materialParams.particlesEnabled) {
        return createParticleMaterial(geometry);
    } else if (materialParams.wireframeEnabled) {
        const wireframeMaterial = createWireframeMaterial(geometry);
        return {
            geometry: geometry,
            material: wireframeMaterial
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
        // Calculate animated position
        const angle = time * speed + i * 0.1;
        const offsetX = Math.sin(angle) * intensity * 0.1;
        const offsetY = Math.cos(angle * 0.7) * intensity * 0.1;
        const offsetZ = Math.sin(angle * 0.5) * intensity * 0.1;

        dummy.position.set(
            pos.x + offsetX,
            pos.y + offsetY,
            pos.z + offsetZ
        );

        // Animate rotation too
        dummy.rotation.set(
            Math.sin(angle * 0.5) * 0.5,
            Math.cos(angle * 0.3) * 0.5,
            Math.sin(angle * 0.7) * 0.5
        );

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
}