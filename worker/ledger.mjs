export const PERIOD=90*86400000;
export function freshLedger(seed=0,now=Date.now()){return {month:new Date(now).toISOString().slice(0,7),monthCost:seed,totalCost:seed,visitors:{},ips:{},holds:{},hour:Math.floor(now/3600000),attempts:0};}
export function roll(l,now){const month=new Date(now).toISOString().slice(0,7);if(l.month!==month){l.month=month;l.monthCost=0;}const hour=Math.floor(now/3600000);if(hour!==l.hour){l.hour=hour;l.attempts=0;}for(const [k,v]of Object.entries(l.visitors))if(v.expires<now)delete l.visitors[k];for(const [k,v]of Object.entries(l.ips))if(v.day<Math.floor(now/86400000))delete l.ips[k];for(const [k,h]of Object.entries(l.holds))if(now-h.time>180000){if(l.visitors[h.visitor])l.visitors[h.visitor].busy=false;delete l.holds[k];}return l;}
function ipEntry(l,ip,now){return l.ips[ip]??=( {day:Math.floor(now/86400000),hour:Math.floor(now/3600000),attempts:0,issued:0,success:0});}
export function issue(l,visitor,ip,now){roll(l,now);if(l.visitors[visitor])return true;const i=ipEntry(l,ip,now);if(i.issued>=12||Object.keys(l.visitors).length>=5000)return false;i.issued++;l.visitors[visitor]={success:0,hour:Math.floor(now/3600000),attempts:0,busy:false,expires:now+PERIOD};return true;}
export function reserve(l,{visitor,ip,id,cost,now,monthly=10000000,total=2000000}){roll(l,now);const v=l.visitors[visitor];if(!v)return {status:403,error:'Reload this page before using AI.'};const i=ipEntry(l,ip,now);const hour=Math.floor(now/3600000);if(v.hour!==hour){v.hour=hour;v.attempts=0;}if(i.hour!==hour){i.hour=hour;i.attempts=0;}
if(v.success>=3)return {status:429,error:'Your three AI requests are used. Manual controls, scenes and exports remain available.'};
if(v.busy)return {status:409,error:'Your previous AI request is still running.'};
if(v.attempts>=6||i.attempts>=12||l.attempts>=40||i.success>=9)return {status:429,error:'AI is temporarily rate-limited. Please try later; manual controls and exports still work.'};
// Failed requests still spend attempt allowance. Reserve before network activity.
v.attempts++;i.attempts++;l.attempts++;
if(l.disabled||l.monthCost+cost>monthly||l.totalCost+cost>total)return {status:429,error:'The shared AI budget is used up. Manual controls, scenes and exports remain available.'};
v.busy=true;l.monthCost+=cost;l.totalCost+=cost;l.holds[id]={visitor,ip,cost,time:now,month:l.month};return {status:200};}
export function settle(l,id,actual,success){const h=l.holds[id];if(!h)return;const charged=Number.isSafeInteger(actual)&&actual>=0?actual:h.cost;const refund=h.cost-charged;l.totalCost-=refund;if(l.month===h.month)l.monthCost-=refund;if(charged>h.cost)l.disabled=true;const v=l.visitors[h.visitor];if(v){v.busy=false;if(success)v.success++;}if(success&&l.ips[h.ip])l.ips[h.ip].success++;delete l.holds[id];}
