import { handleAPIResponse } from './chatInterface.js';
import { getCurrentState } from './visitorState.js';
import { createText, getTextMesh } from './three.setup.js';
import { textParams } from '../parameters/textParams.js';
const intro=document.querySelector('#experiment-intro');
try { if(localStorage.getItem('text2typo-intro-2026')!=='seen')intro.showModal(); } catch {intro.showModal();}
intro.addEventListener('close',()=>{try{localStorage.setItem('text2typo-intro-2026','seen')}catch{}});
document.querySelector('#about-experiment').addEventListener('click',()=>intro.showModal());
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clean={tessellationEnabled:false,wireframeEnabled:false,particlesEnabled:false,projectionEnabled:false,multiTextEnabled:false,scrambleEnabled:false,scaleEnabled:false,rotateXEnabled:false,rotateYEnabled:false,rotateZEnabled:false,manipulationAnimationEnabled:false,color:'#ffffff',backgroundColor:'#000000',textSize:5,height:1.4,metalness:0,roughness:0.5,scenePositionX:0,scenePositionY:0};
const scenes=[
 {name:'Solid',hint:'Quiet, sculptural type',patch:{color:'#e8e3d7',height:2.4,roughness:0.3}},
 {name:'Wire',hint:'An electric skeleton',patch:{wireframeEnabled:true,wireframeOpacity:0.9,color:'#b7ff55',height:1.6,rotateYEnabled:!reduced,rotateY:0.004}},
 {name:'Cloud',hint:'Type dissolving into particles',patch:{particlesEnabled:true,particleShape:'sphere',particleSize:0.08,particleDensity:0.5,particleScale:1,particleRandomness:0.2,color:'#d0a4ff',manipulationAnimationEnabled:!reduced,manipulationAnimationSpeed:0.4,manipulationAnimationIntensity:0.5}},
 {name:'Orbit',hint:'Type wrapped around a knot',patch:{projectionEnabled:true,projectionType:'pattern',projectionMode:'torusknot',projectionScale:1,patternAnimatePattern:!reduced,patternAnimationSpeed:0.004,patternRepeatX:3,patternRepeatY:1,patternBackgroundColor:'#111111',patternTextColor:'#fa7756',patternOpacity:1}}
];
const holder=document.querySelector('#scene-presets');
for(const scene of scenes){const button=document.createElement('button');button.textContent=scene.name;button.title=scene.hint;button.dataset.scene=scene.name;button.addEventListener('click',()=>{handleAPIResponse({silent:true,response:{...clean,...scene.patch},changes:[scene.hint]});window.dispatchEvent(new CustomEvent('scene-message',{detail:scene.hint}));holder.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});holder.append(button);}
const toggle=document.querySelector('#edit-mode-toggle');
function syncTabs(){const manual=toggle.classList.contains('active');for(const [id,selected] of [['choose-ai',!manual],['choose-manual',manual]]){const b=document.getElementById(id);b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));}}
document.querySelector('#choose-ai').onclick=()=>{if(toggle.classList.contains('active'))toggle.click();};
document.querySelector('#choose-manual').onclick=()=>{if(!toggle.classList.contains('active'))toggle.click();};
toggle.addEventListener('click',syncTabs);
const canvas=document.querySelector('#canvas-container');
const tools=document.createElement('div');tools.className='canvas-tools';tools.innerHTML='<span>DRAG TO ORBIT · SCROLL TO ZOOM</span><button type="button" id="frame-type">Fit type</button>';
canvas.append(tools);document.querySelector('#frame-type').onclick=()=>createText();
const toast=document.createElement('div');toast.className='scene-toast';toast.setAttribute('role','status');canvas.append(toast);let toastTimer;
window.addEventListener('scene-message',e=>{toast.textContent=e.detail;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.textContent=''},6000)});
// Explain availability without pretending that a mock response is AI.
fetch('/api/status').then(r=>r.json()).then(s=>{document.querySelector('#ai-availability').textContent=s.message;document.querySelector('#send').disabled=!s.enabled;document.querySelector('#send').title=s.enabled?'Customize the scene':'AI is paused in this preview';}).catch(()=>{});
// Add accessible names to legacy controls without changing visible labels.
for(const input of document.querySelectorAll('input,select')){if(!input.getAttribute('aria-label')&&!document.querySelector('label[for="'+input.id+'"]'))input.setAttribute('aria-label',input.id.replaceAll('-',' '));}
