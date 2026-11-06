import { DurableObject } from 'cloudflare:workers';
import {models} from './models.mjs';
import {cleanState} from './scene.mjs';
import {buildRequest,reserveCost,generate} from './provider.mjs';
import {freshLedger,issue,reserve,settle,PERIOD,limitsAt} from './ledger.mjs';
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});
const disabled='AI is temporarily unavailable. Instant scenes, manual controls and exports remain available.';
const enc=new TextEncoder();
async function mac(secret,text){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(text))),x=>x.toString(16).padStart(2,'0')).join('');}
async function visitorId(request,secret){const value=request.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-text2typo=([^;]+)/)?.[1];if(!value)return null;const [id,expiry,signature]=value.split('.');if(!/^[a-f0-9-]{36}$/.test(id)||!/^\d+$/.test(expiry)||Number(expiry)<Date.now()||Number(expiry)>Date.now()+PERIOD)return null;const expected=await mac(secret,id+'.'+expiry);if(signature?.length!==expected.length)return null;let difference=0;for(let i=0;i<expected.length;i++)difference|=expected.charCodeAt(i)^signature.charCodeAt(i);return difference?null:id;}
export class Allowance extends DurableObject {
 constructor(ctx,env){super(ctx,env);this.ctx=ctx;this.env=env;}
 async transact(fn){return this.ctx.storage.transaction(async tx=>{const ledger=await tx.get('ledger')||freshLedger(Number(this.env.INITIAL_SPEND_MICRO||0));const result=fn(ledger);await tx.put('ledger',ledger);return result;});}
 async fetch(request){const path=new URL(request.url).pathname;const now=Date.now();const limits=limitsAt(this.env.TESTING_UNTIL,now);const enabled=this.env.AI_ENABLED==='true'&&!!this.env.OPENROUTER_API_KEY&&!!this.env.VISITOR_SECRET;
 if(!enabled)return path==='/api/status'?json({enabled:false,models,remaining:limits.success,message:disabled}):json({error:disabled},503);
 const ip=await mac(this.env.VISITOR_SECRET,'ip:'+normalizeIP(request.headers.get('CF-Connecting-IP')||'local'));
 let visitor=await visitorId(request,this.env.VISITOR_SECRET);let cookie;
 if(!visitor){if(request.method!=='GET'||path!=='/api/status')return json({error:'Reload this page before using AI.'},403);visitor=crypto.randomUUID();const expiry=now+PERIOD;const value=visitor+'.'+expiry;cookie=`__Host-text2typo=${value}.${await mac(this.env.VISITOR_SECRET,value)}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(PERIOD/1000)}`;}
 if(path==='/api/status'&&request.method==='GET'){const status=await this.transact(l=>{if(!issue(l,visitor,ip,now,limits))return {enabled:false,remaining:0,message:'AI is temporarily rate-limited on this connection. Manual controls and exports remain available.'};const remaining=Math.max(0,limits.success-l.visitors[visitor].success);const available=!l.disabled&&l.totalCost<Math.min(10000000,Math.max(0,Number(this.env.TOTAL_BUDGET_MICRO)||0))&&l.monthCost<10000000;return {enabled:available&&remaining>0,remaining,message:!available?'The shared AI budget is used up. Manual controls and exports remain available.':remaining?`${remaining} AI requests remaining, shared across all models.${limits.success>3?" Temporary testing allowance.":""}`:'Your AI request allowance is used. Manual controls and exports remain available.'};});return json({...status,models},200,cookie?{'Set-Cookie':cookie}:{});}
 if(path!=='/api/customize'||request.method!=='POST')return json({error:'Not found'},404);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Use the form on this website.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Invalid request'},415);
 let input;try{const length=Number(request.headers.get('Content-Length'));if(length>16000)throw Error();const reader=request.body?.getReader();if(!reader)throw Error();const parts=[];let count=0;while(true){const {value,done}=await reader.read();if(done)break;count+=value.byteLength;if(count>16000){await reader.cancel();throw Error();}parts.push(value);}const bytes=new Uint8Array(count);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}input=JSON.parse(new TextDecoder().decode(bytes));}catch{return json({error:'Request is too large or invalid.'},400);}
 let model,body,cost;try{if(typeof input.prompt!=='string'||!input.prompt.trim()||input.prompt.length>600)throw Error();model=models.find(m=>m.id===input.model);if(!model)throw Error();body=buildRequest(model,input.prompt,cleanState(input.state));cost=reserveCost(body,model);}catch{return json({error:'Choose a supported model and enter a prompt of up to 600 characters.'},400);}
 const id=crypto.randomUUID();const held=await this.transact(l=>reserve(l,{visitor,ip,id,cost,now,limits,monthly:10000000,total:Math.min(10000000,Math.max(0,Number(this.env.TOTAL_BUDGET_MICRO)||0))}));if(held.status!==200)return json({error:held.error},held.status,{'Retry-After':'3600'});
 let output;try{output=await generate(this.env.OPENROUTER_API_KEY,body);}catch{output={error:'AI timed out or is unavailable. Your request allowance was not used; manual controls still work.',cost:null};}
 const remaining=await this.transact(l=>{settle(l,id,output.cost,!output.error);return Math.max(0,limits.success-(l.visitors[visitor]?.success||0));});
 if(output.error)return json({error:output.error,code:output.code||'provider_unavailable',remaining},502);
 return json({response:output.patch,message:output.message,remaining,model:model.id,usage:output.usage,costUSD:output.cost===null?null:output.cost/1e6});
 }
}
export function normalizeIP(ip){return ip.includes(':')?ip.split(':').slice(0,4).join(':'):ip;}
export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path.startsWith('/api/'))return env.ALLOWANCE.get(env.ALLOWANCE.idFromName('text2typo-global-v1')).fetch(request);const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);headers.set('X-Robots-Tag','noindex, nofollow');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');return new Response(response.body,{status:response.status,headers});}};
