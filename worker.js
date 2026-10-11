/**
 * Reel reverse-proxy for the jesusrevolution.global static site.
 * Forwards only /watch, /_next/*, and /api/public/* to the jrsm app (adding the
 * unlock secret); everything else is served by the existing static assets.
 */
const PROXY_PREFIXES = ["/_next/", "/api/public/"];

function isProxied(pathname) {
  if (pathname === "/watch" || pathname.startsWith("/watch/")) return true;
  return PROXY_PREFIXES.some((p) => pathname.startsWith(p));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (isProxied(url.pathname)) {
      const target = new URL(url.pathname + url.search, env.JRSM_ORIGIN);
      const headers = new Headers(request.headers);
      headers.set("x-reel-proxy", env.REEL_PROXY_SECRET);
      headers.set("host", new URL(env.JRSM_ORIGIN).host);
      const proxied = new Request(target, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      });
      return fetch(proxied);
    }
    return env.ASSETS.fetch(request);
  },
};
