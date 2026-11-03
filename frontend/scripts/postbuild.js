import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.resolve(__dirname, "../dist/client");
const templatePath = path.resolve(__dirname, "../dist/client/index.html.template");
const publicTemplatePath = path.resolve(__dirname, "../public/index.html.template");
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

// 2. Read template
let template = "";
if (fs.existsSync(publicTemplatePath)) {
  template = fs.readFileSync(publicTemplatePath, "utf8");
} else if (fs.existsSync(templatePath)) {
  template = fs.readFileSync(templatePath, "utf8");
}

if (template && jsFile) {
  if (cssFile) {
    template = template.replace(/\/assets\/styles-[^"]+\.css/g, `/assets/${cssFile}`);
  }
  template = template.replace(/\/assets\/index-[^"]+\.js/g, `/assets/${jsFile}`);
  fs.writeFileSync(targetHtml, template, "utf8");
  console.log(`[postbuild] Successfully created ${targetHtml}`);
} else {
  console.warn("[postbuild] Warning: Could not find template or main JS bundle.");
}

// 3. Ensure .htaccess is in dist/client
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

