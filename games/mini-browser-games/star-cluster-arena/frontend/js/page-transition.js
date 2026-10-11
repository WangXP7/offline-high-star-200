(function attachScaPageTransition(globalScope) {
  "use strict";

  const CURTAIN_ID = "scaNavigationCurtain";

  function cover() {
    const documentRef = globalScope.document;
    if (!documentRef?.body) return null;
    let curtain = documentRef.getElementById(CURTAIN_ID);
    if (!curtain) {
      curtain = documentRef.createElement("div");
      curtain.id = CURTAIN_ID;
      curtain.setAttribute("aria-hidden", "true");
      curtain.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#061015;opacity:0;pointer-events:auto;transition:opacity 70ms linear";
      documentRef.body.appendChild(curtain);
    }
    curtain.getBoundingClientRect();
    curtain.style.opacity = "1";
    documentRef.documentElement.dataset.scaNavigating = "true";
    return curtain;
  }

  function navigate(url) {
    const documentRef = globalScope.document;
    if (documentRef?.documentElement?.dataset?.scaNavigating === "true") return false;
    cover();
    const destination = String(url || "");
    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      if (typeof globalScope.location?.assign === "function") globalScope.location.assign(destination);
      else globalScope.location.href = destination;
    };
    globalScope.requestAnimationFrame?.(() => globalScope.requestAnimationFrame?.(commit));
    globalScope.setTimeout?.(commit, 90);
    return true;
  }

  globalScope.ScaPageTransition = Object.freeze({ cover, navigate });
})(typeof globalThis !== "undefined" ? globalThis : window);
