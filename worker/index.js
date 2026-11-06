const message='AI is paused while the new model is evaluated. Instant scenes, manual controls and exports are available.';
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/api/status')return Response.json({enabled:false,allowance:3,message},{headers:{'Cache-Control':'no-store'}});
 if(url.pathname.startsWith('/api/'))return Response.json({error:message},{status:503,headers:{'Cache-Control':'no-store'}});
 const response=await env.ASSETS.fetch(request);const headers=new Headers(response.headers);
 headers.set('X-Robots-Tag','noindex, nofollow');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 return new Response(response.body,{status:response.status,headers});
}};
