// Generates a static index.html shell into dist/client so Capacitor has
// something to package. The shell loads the live web app inside the Android
// WebView. This is the standard approach for wrapping an SSR TanStack Start
// app as a Capacitor APK.
//
// Configure the target URL with the CAPACITOR_REMOTE_URL secret in GitHub.
// Fallback below uses the published Lovable host so the debug APK works
// after the site has been published.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ID = "decc67c2-b397-453a-98ef-1296404f6cba";
const remoteUrl =
  process.env.CAPACITOR_REMOTE_URL ||
  `https://project--${PROJECT_ID}.lovable.app`;

const outDir = join(process.cwd(), "dist", "client");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#22d3ee" />
    <title>Earn with DG</title>
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: #0b0f17; color: #e2e8f0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
      #shell { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; padding: 24px; text-align: center; }
      .dot { width: 12px; height: 12px; border-radius: 50%; background: #22d3ee; animation: pulse 1.2s infinite ease-in-out; }
      @keyframes pulse { 0%,100% { opacity: .3 } 50% { opacity: 1 } }
      a, button { color: #0b0f17; background: #22d3ee; border: 0; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; cursor: pointer; }
      .muted { color: #94a3b8; font-size: 13px; max-width: 320px; }
      #fallback { display: none; flex-direction: column; gap: 14px; align-items: center; }
    </style>
  </head>
  <body>
    <div id="shell">
      <div id="loading">
        <div class="dot"></div>
        <div style="margin-top:12px">Loading Earn with DG…</div>
      </div>
      <div id="fallback">
        <div style="font-size:18px;font-weight:600">Couldn't reach the app</div>
        <div class="muted">Check your internet connection and try again.</div>
        <button onclick="go()">Retry</button>
        <a href="${remoteUrl}" target="_blank" rel="noopener">Open in browser</a>
      </div>
    </div>
    <script>
      var TARGET = ${JSON.stringify(remoteUrl)};
      function go(){
        document.getElementById('fallback').style.display = 'none';
        document.getElementById('loading').style.display = 'block';
        window.location.replace(TARGET);
      }
      function showFallback(){
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fallback').style.display = 'flex';
      }
      // If redirect hasn't taken us away in 8s, show fallback UI.
      setTimeout(showFallback, 8000);
      try { window.location.replace(TARGET); } catch(e) { showFallback(); }
    </script>
  </body>
</html>
`;

writeFileSync(join(outDir, "index.html"), html, "utf8");
console.log(`[capacitor-postbuild] wrote dist/client/index.html -> ${remoteUrl}`);
