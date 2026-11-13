import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.resolve(__dirname, "../dist/client");
const targetHtml = path.resolve(clientDir, "index.html");
const targetHtaccess = path.resolve(clientDir, ".htaccess");

// 1. Ensure assets directory exists
const assetsDir = path.resolve(clientDir, "assets");
if (!fs.existsSync(assetsDir)) {
  console.log("[postbuild] No assets directory found in dist/client, skipping.");
  process.exit(0);
}

const files = fs.readdirSync(assetsDir);
const jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

console.log(`[postbuild] Found JS entry: ${jsFile}, CSS entry: ${cssFile}`);

// 2. Generate self-contained index.html
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>The Handicraft House — Premium Handcrafted Bamboo Living</title>
  <meta name="description" content="Luxury bamboo lamps, furniture, kitchenware and décor, handwoven by independent artisans. Sustainable, plastic-free, made to last."/>
  <meta name="author" content="The Handicraft House"/>
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="The Handicraft House — Premium Handcrafted Bamboo Living"/>
  <meta property="og:description" content="Luxury bamboo lamps, furniture, kitchenware and décor, handwoven by independent artisans."/>
  <meta name="twitter:card" content="summary_large_image"/>
  <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
  <link rel="icon" href="/favicon.png" type="image/png"/>
  <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Manrope:wght@300;400;500;600&family=Inter:wght@400;500&display=swap"/>
  ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}"/>` : ""}
</head>
<body>
  <div id="root"></div>
  <script>
    // Polyfill TanStack Start router window state for SPA static hosting
    window.$_TSR = window.$_TSR || {
      t: new Map(),
      buffer: [],
      h: function() {},
      router: {
        manifest: { routes: {} },
        matches: [],
        dehydratedData: {}
      }
    };
  </script>
  ${
    jsFile
      ? `<script type="module" src="/assets/${jsFile}"></script>`
      : ""
  }
</body>
</html>
`;

fs.writeFileSync(targetHtml, htmlContent, "utf8");
console.log(`[postbuild] Successfully created ${targetHtml}`);

// 3. Ensure .htaccess is in dist/client for SPA routing on Hostinger Apache
const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
`;

fs.writeFileSync(targetHtaccess, htaccessContent, "utf8");
console.log(`[postbuild] Successfully wrote .htaccess to ${targetHtaccess}`);
