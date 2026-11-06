import {motionParams} from '../parameters/motionParams.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const declarations=`uniform float typoTime; uniform float typoMode; uniform float typoAmplitude; uniform float typoSpeed; uniform float typoFrequency;
vec3 typoDeform(vec3 p){float phase=p.x*typoFrequency+typoTime*typoSpeed*2.0;
 if(typoMode<0.5)return p;
 if(typoMode<1.5){p.y+=sin(phase)*typoAmplitude;p.z+=cos(phase*.7)*typoAmplitude*.25;}
 else if(typoMode<2.5){float a=sin(phase*.55)*typoAmplitude*.3;float y=p.y;p.y=y*cos(a)-p.z*sin(a);p.z=y*sin(a)+p.z*cos(a);}
 else if(typoMode<3.5){p.z+=sin(length(p.xy)*typoFrequency-typoTime*typoSpeed*2.0)*typoAmplitude;}
 else {p.y+=sin(typoTime*typoSpeed)*typoAmplitude;p.z+=cos(typoTime*typoSpeed*.7)*typoAmplitude*.3;}
 return p;}
`;
let active=[];let paused=false;let time=0;let previous=performance.now();
export function attachMotion(mesh){active=[];if(!mesh||mesh.isInstancedMesh)return;const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const material of materials){if(!material)continue;const uniforms={typoTime:{value:0},typoMode:{value:0},typoAmplitude:{value:0},typoSpeed:{value:1},typoFrequency:{value:.3}};active.push(uniforms);
 if(material.isShaderMaterial){Object.assign(material.uniforms,uniforms);material.vertexShader=declarations+material.vertexShader.replace('gl_Position =','newPosition = typoDeform(newPosition);\n gl_Position =');}
 else {material.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniforms);shader.vertexShader=declarations+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed = typoDeform(transformed);');};material.customProgramCacheKey=()=> 'text2typo-motion-v1';}
 material.needsUpdate=true;}}
export function tickMotion(now){const dt=Math.min(.05,(now-previous)/1000);previous=now;if(!paused&&!reduced.matches)time+=dt;const mode=['none','wave','twist','ripple','float'].indexOf(motionParams.motionMode);for(const u of active){u.typoTime.value=time;u.typoMode.value=reduced.matches?0:Math.max(0,mode);u.typoAmplitude.value=motionParams.motionAmplitude;u.typoSpeed.value=motionParams.motionSpeed;u.typoFrequency.value=motionParams.motionFrequency;}}
export function setMotionPaused(value){paused=value;}
