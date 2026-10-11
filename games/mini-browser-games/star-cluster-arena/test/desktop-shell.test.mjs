import assert from "node:assert/strict";
import test from "node:test";

import { EXTERNAL_HTTPS_HOSTS, normalizeExternalUrl } from "../desktop/external-links.mjs";

test("desktop external links allow only the documented author destinations", () => {
  assert.deepEqual(EXTERNAL_HTTPS_HOSTS, [
    "github.com",
    "blog.csdn.net",
    "space.bilibili.com"
  ]);
  assert.equal(normalizeExternalUrl("https://github.com/wangzifan396-wzf/mini-browser-games")?.hostname, "github.com");
  assert.equal(normalizeExternalUrl("https://blog.csdn.net/m0_74023007")?.hostname, "blog.csdn.net");
  assert.equal(normalizeExternalUrl("https://www.xiaoheihe.cn/community/45509815"), null);
  assert.equal(normalizeExternalUrl("https://space.bilibili.com/319363325")?.hostname, "space.bilibili.com");
  assert.equal(normalizeExternalUrl("https://example.com"), null);
  assert.equal(normalizeExternalUrl("http://github.com/wangzifan396-wzf"), null);
  assert.equal(normalizeExternalUrl("https://user:pass@github.com/wangzifan396-wzf"), null);
});

test("desktop QQ protocol is pinned to the documented contact", () => {
  assert.equal(normalizeExternalUrl("tencent://message/?uin=530142376")?.protocol, "tencent:");
  assert.equal(normalizeExternalUrl("tencent://message/?uin=123456"), null);
  assert.equal(normalizeExternalUrl("cmd://message/?uin=530142376"), null);
});
