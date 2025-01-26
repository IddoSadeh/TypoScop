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

// Fragment shader for tessellation (with physical material properties)
const tessellationFragmentShader = `
    uniform float metalness;
    uniform float roughness;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec3 light = normalize(vec3(5.0, 5.0, 10.0));
        vec3 viewDir = normalize(-vPosition);
        
        // Ambient
        float ambientStrength = 0.3;
        vec3 ambient = ambientStrength * vColor;
        
        // Diffuse
        float diff = max(dot(vNormal, light), 0.0);
        vec3 diffuse = diff * vColor;
        
        // Specular
        vec3 reflectDir = reflect(-light, vNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        float specularStrength = metalness * (1.0 - roughness);
        vec3 specular = specularStrength * spec * vec3(1.0);
        
        vec3 finalColor = ambient + diffuse + specular;
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Fragment shader for wireframe (with transparency and additive blending)
const wireframeFragmentShader = `
    uniform float opacity;
    uniform vec3 baseColor;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vec3 light = normalize(vec3(5.0, 5.0, 10.0));
        
        // Basic lighting
        float diffuse = max(dot(vNormal, light), 0.0);
        float ambient = 0.3;
        float brightness = ambient + diffuse;
        
        // Mix base color with vertex color
        vec3 finalColor = mix(vColor, baseColor, 0.5) * brightness;
        
        // Apply glow effect for wireframe
        float glowFactor = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), 2.0);
        finalColor += glowFactor * 0.5;
        
        gl_FragColor = vec4(finalColor, opacity);
    }
`;

function calculateColorForVertex(progress, baseHSL) {
    let h, s, l;
    
    switch (materialParams.colorPattern) {
        case 'gradient':
            h = baseHSL.h + (materialParams.colorHueRange * progress);
            s = baseHSL.s + (materialParams.colorSatRange * progress);
            l = baseHSL.l + (materialParams.colorLightRange * progress);
            break;
            
        case 'waves':
            const wave = Math.sin(progress * Math.PI * 2);
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

    // Ensure values are in valid range
    h = ((h % 1) + 1) % 1;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));

    return { h, s, l };
}

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
    const baseHSL = {};
    baseColor.getHSL(baseHSL);

    // Assign colors and displacement to each face
    for (let f = 0; f < numFaces; f++) {
        const index = 9 * f;
        const progress = f / numFaces;
        
        const { h, s, l } = calculateColorForVertex(progress, baseHSL);
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
        const { h, s, l } = calculateColorForVertex(progress, baseHSL);
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

export function createMaterial(geometry) {
    if (materialParams.wireframeEnabled) {
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

    // Get current time for animations
    const currentTime = Date.now() * 0.001;

    // Update amplitude based on material type and animation state
    if (materialParams.tessellationEnabled && materialParams.manipulationAnimationEnabled) {
        // Tessellation animation
        const time = currentTime * materialParams.manipulationAnimationSpeed;
        mesh.material.uniforms.amplitude.value = 
            materialParams.manipulationAnimationIntensity * Math.sin(time);
    } else if (materialParams.wireframeEnabled && materialParams.manipulationAnimationEnabled) {
        // Wireframe animation
        const time = currentTime * materialParams.manipulationAnimationSpeed;
        mesh.material.uniforms.amplitude.value = 
            materialParams.manipulationAnimationIntensity * Math.sin(time);
    } else {
        // Reset amplitude when animation is disabled
        mesh.material.uniforms.amplitude.value = 0;
    }
    
    // Update material-specific uniforms
    if (materialParams.tessellationEnabled || materialParams.wireframeEnabled) {
        // Update metalness and roughness for both material types
        if (mesh.material.uniforms.metalness) {
            mesh.material.uniforms.metalness.value = materialParams.metalness;
        }
        if (mesh.material.uniforms.roughness) {
            mesh.material.uniforms.roughness.value = materialParams.roughness;
        }
    }
    
    // Update wireframe-specific uniforms
    if (materialParams.wireframeEnabled) {
        if (mesh.material.uniforms.opacity) {
            mesh.material.uniforms.opacity.value = materialParams.wireframeOpacity;
        }
        if (mesh.material.uniforms.baseColor) {
            mesh.material.uniforms.baseColor.value.set(materialParams.color);
        }
    }
}