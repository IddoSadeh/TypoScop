import {schema,system,parsePatch} from './scene.mjs';
export const MAX_OUTPUT=2048;
export function buildRequest(model,prompt,state){return {model:model.id,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify({prompt,scene:state})}],max_tokens:MAX_OUTPUT,...(model.reasoning?{reasoning:{effort:'low',exclude:true}}:{}),response_format:{type:'json_schema',json_schema:{name:'typography_patch',strict:true,schema}},provider:{require_parameters:true,allow_fallbacks:false,max_price:{prompt:model.input,completion:model.output}},stream:false};}
// Conservative bounded input charge: two tokens per serialized UTF-8 byte plus
// framing allowance. Output reserve covers 2x max_tokens, including reasoning.
export function reserveCost(body,model){const bytes=new TextEncoder().encode(JSON.stringify(body)).length;if(bytes>32000)throw Error('Request too large');return Math.ceil((bytes*2+8192)*model.input+MAX_OUTPUT*2*model.output);}
export async function generate(key,body,fetcher=fetch){const start=Date.now();let raw;const response=await fetcher('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','HTTP-Referer':'https://text2typo-preview.iddosadeh.workers.dev','X-OpenRouter-Title':'Text2Typo'},body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});try{raw=await response.json()}catch{throw Error('AI provider unavailable')}
const usage=raw.usage;const cost=usage&&Number.isFinite(usage.cost)&&usage.cost>=0?Math.ceil(usage.cost*1e6):null;
const result={cost,usage:usage?{input:usage.prompt_tokens,output:usage.completion_tokens,reasoning:usage.completion_tokens_details?.reasoning_tokens||0}:null,latency:Date.now()-start,id:raw.id,model:raw.model,provider:raw.provider};
if(!response.ok||raw.error)return {...result,error:'AI provider could not complete this request. Try again later; your allowance was not used.'};
try{const c=raw.choices?.[0];if(c?.finish_reason!=='stop')throw Error('Incomplete output');return {...result,...parsePatch(JSON.parse(c.message.content))};}catch{return {...result,error:'The model did not return a supported scene. Your allowance was not used.'};}}
