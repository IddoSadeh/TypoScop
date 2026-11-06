import { motionParams } from '../parameters/motionParams.js';
import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';
import { projectionParams } from '../parameters/projectionParams.js';
// Never serialize Three.js objects or another visitor's state.
export function getCurrentState() {
 const state = {};
 for (const group of [textParams, materialParams, sceneParams, animationParams, motionParams]) {
  for (const [k,v] of Object.entries(group)) if (['string','number','boolean'].includes(typeof v)) state[k]=v;
 }
 state.textSize=textParams.size; delete state.size;
 state.scenePositionX=sceneParams.position.x; state.scenePositionY=sceneParams.position.y;
 Object.assign(state,{projectionEnabled:projectionParams.enabled,projectionType:projectionParams.projectionType,projectionMode:projectionParams.mode,projectionScale:projectionParams.scale,projectionRepeat:projectionParams.repeat});
 for (const [k,v] of Object.entries(projectionParams.pattern)) state['pattern'+k[0].toUpperCase()+k.slice(1)]=v;
 for(const k of ['currentScale','scaleDirection','scrambleProgress','lastScrambleTime']) delete state[k];
 return state;
}
