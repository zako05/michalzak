const ZDOCS_ORIGIN = 'https://zako05.github.io/zdocs05';

const ONLINE_CV_PREFIXES = [
  '/online-cv',
  '/mcp',
  '/api',
  '/openapi.json',
  '/.well-known',
  '/llms.txt',
  '/llms-full.txt',
  '/robots.txt',
  '/sitemap.xml',
];

function isOnlineCvPath(pathname) {
  return ONLINE_CV_PREFIXES.some(
    p => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = (request.headers.get('Accept') || '').toLowerCase();

    // 1. ZDocs05 (/docs -> /docs/ -> GitHub Pages)
    if (url.pathname === '/docs') {
      return Response.redirect(`${url.origin}/docs/`, 301);
    }
    if (url.pathname.startsWith('/docs/')) {
      const subPath = url.pathname.slice('/docs'.length);
      const res = await fetch(`${ZDOCS_ORIGIN}${subPath}${url.search}`, {
        method: request.method,
        headers: { 'User-Agent': request.headers.get('User-Agent') || 'MichalZak-Worker' },
        redirect: 'follow',
      });
      return new Response(request.method === 'HEAD' ? null : res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    }

    // 2. Online CV + MCP / OpenAPI / Agentic Markdown on `/`
    const wantsMarkdownAtRoot =
      (url.pathname === '/' || url.pathname === '') &&
      (accept.includes('text/markdown') || accept.includes('text/x-markdown'));

    if (isOnlineCvPath(url.pathname) || wantsMarkdownAtRoot) {
      return env.ONLINE_CV.fetch(request);
    }

    // 3. Personal Homepage static files (./public)
    return env.ASSETS.fetch(request);
  },
};
