"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Force a fresh check for an updated worker on every page load so
          // bug fixes to sw.js don't have to wait the default 24h SW TTL.
          registration.update().catch(() => {});

          // When a new worker is installed alongside the active one, ask it
          // to skip waiting so it takes over immediately.
          registration.addEventListener("updatefound", () => {
            const installing = registration.installing;
            if (!installing) return;
            installing.addEventListener("statechange", () => {
              if (
                installing.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                installing.postMessage("SKIP_WAITING");
              }
            });
          });
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });

      // Once the new worker takes control, reload so all in-flight network
      // logic (e.g. socket.io polling) runs under the corrected fetch handler.
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
