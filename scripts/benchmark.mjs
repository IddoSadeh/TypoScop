import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {models} from '../worker/models.mjs';import {buildRequest,reserveCost,generate} from '../worker/provider.mjs';
const directory=new URL('../outputs/evaluation/',import.meta.url);mkdirSync(directory,{recursive:true});const ledgerFile=new URL('budget.json',directory);let ledger=existsSync(ledgerFile)?JSON.parse(readFileSync(ledgerFile)): {limit:2000000,charged:0,records:[]};
const key=readFileSync('/Users/iddo/Desktop/assistant/operations/private/text2typo/openrouter-key','utf8').trim();
const prompts=[
 'Keep the wording and font. Use pale mint #b8ffdc on background #180b2d. Add a gentle travelling wave. No spinning or particles.',
 'Wrap the existing text around a torus knot as orange text on a dark texture. Animate the texture slowly. Keep the wording. No particles.',
 'Keep the text and font. Turn it into gently moving purple particles, without projection or rotating the text.'
];
const state={text:'TYPE',font:'helvetiker',color:'#ffffff',backgroundColor:'#000000',textSize:5,height:1.4,wireframeEnabled:false,particlesEnabled:false,projectionEnabled:false,rotateXEnabled:false,rotateYEnabled:false,rotateZEnabled:false,motionMode:'none'};
const queue=models.flatMap(m=>prompts.slice(0,m.id.includes('sonnet-5.5')||m.id.includes('opus-5.5')?3:1).map((prompt,i)=>({m,prompt,i})));
for(const {m,prompt,i} of queue){if(ledger.records.some(r=>r.model===m.id&&r.case===i))continue;const body=buildRequest(m,prompt,state);const reserved=reserveCost(body,m);if(ledger.charged+reserved>ledger.limit){console.log('Budget bound reached; remaining calls skipped');break;}const entry={model:m.id,case:i,prompt,reserved,charged:reserved,status:'reserved'};ledger.records.push(entry);ledger.charged+=reserved;writeFileSync(ledgerFile,JSON.stringify(ledger,null,2));let result;try{result=await generate(key,body);}catch(e){result={cost:null,error:e.name==='TimeoutError'?'timeout':'transport failure'};}const charged=Number.isSafeInteger(result.cost)&&result.cost>=0?result.cost:reserved;ledger.charged+=charged-reserved;Object.assign(entry,{charged,status:result.error?'failed':'success',result});writeFileSync(ledgerFile,JSON.stringify(ledger,null,2));console.log(JSON.stringify({model:m.id,case:i,status:entry.status,chargedUSD:charged/1e6,latency:result.latency,tokens:result.usage,patch:result.patch,error:result.error}));if(charged>reserved)throw Error('Cost exceeded reservation; stop evaluation');}
console.log('TOTAL charged/reserved USD',ledger.charged/1e6);
