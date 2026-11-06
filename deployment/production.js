// Stable public address. Keep the existing app, secrets and Durable Object ledger.
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\n', {headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
    const upstream = await env.APP.fetch(request);
    const headers = new Headers(upstream.headers);
    headers.delete('X-Robots-Tag');
    return new Response(upstream.body, {status:upstream.status, statusText:upstream.statusText, headers});
  }
};
