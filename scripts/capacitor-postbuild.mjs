// Generates a static index.html shell into dist/client so Capacitor has
// something to package. The shell loads the live web app (SSR'd by Nitro on
// Cloudflare) inside the Android WebView. This is the standard approach for
// wrapping an SSR TanStack Start app as a Capacitor APK.
//
// Configure the target URL with CAPACITOR_REMOTE_URL. For debug APKs we fall
// back to the stable preview/dev URL so the packaged app works even before the
// site has been published.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ID = "decc67c2-b397-453a-98ef-1296404f6cba";
const remoteUrl =
  process.env.CAPACITOR_REMOTE_URL ||
  `https://project--${PROJECT_ID}-dev.lovable.app`;

const outDir = join(process.cwd(), "dist", "client");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#22d3ee" />
    <title>Earn with DG</title>
    <link rel="icon" href="/favicon.ico" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: #0b0f17; color: #e2e8f0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
      #shell { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; }
      .dot { width: 10px; height: 10px; border-radius: 50%; background: #22d3ee; animation: pulse 1.2s infinite ease-in-out; }
      @keyframes pulse { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
      a { color: #22d3ee; }
    </style>
  </head>
  <body>
    <div id="shell">
      <div class="dot"></div>
      <div>Loading Earn with DG…</div>
      <noscript>This app requires JavaScript. <a href="${remoteUrl}">Open in browser</a></noscript>
    </div>
    <script>
      // Redirect the WebView to the live SSR app.
      window.location.replace(${JSON.stringify(remoteUrl)});
    </script>
  </body>
</html>
`;

writeFileSync(join(outDir, "index.html"), html, "utf8");
console.log(`[capacitor-postbuild] wrote dist/client/index.html -> ${remoteUrl}`);
