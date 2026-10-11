export const EXTERNAL_HTTPS_HOSTS = Object.freeze([
  "github.com",
  "blog.csdn.net",
  "space.bilibili.com"
]);

const allowedHttpsHosts = new Set(EXTERNAL_HTTPS_HOSTS);

export function normalizeExternalUrl(target) {
  let url;
  try { url = new URL(String(target)); } catch { return null; }
  if (url.username || url.password) return null;
  if (url.protocol === "https:" && allowedHttpsHosts.has(url.hostname)) return url;
  if (url.protocol === "tencent:" && url.hostname === "message" && url.searchParams.get("uin") === "530142376") return url;
  return null;
}
