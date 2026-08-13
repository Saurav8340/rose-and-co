const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".vercel",
  "coverage",
  ".turbo",
  "out"
]);

const TARGET_EXT = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".scss",
  ".md",
  ".mdx",
  ".html"
]);

const KEYWORDS = [
  "product",
  "products",
  "collection",
  "collections",
  "cart",
  "checkout",
  "price",
  "size",
  "satin",
  "marble",
  "hand-painted",
  "hand painted",
  "co-ord",
  "engagement",
  "party",
  "gift",
  "rose",
  "Rosé",
  "shipping",
  "refund",
  "return",
  "track",
  "care",
  "fabric",
  "faq",
  "theme",
  "colors",
  "tailwind",
  "#",
  "upi"
];

function walk(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!IGNORE_DIRS.has(item.name)) {
        walk(fullPath, files);
      }
    } else {
      const ext = path.extname(item.name);
      if (TARGET_EXT.has(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function safeRead(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function lineMatches(content) {
  const lines = content.split("\n");
  const matches = [];

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();

    const hit = KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
    if (hit) {
      matches.push({
        lineNumber: index + 1,
        text: line.trim().slice(0, 220)
      });
    }
  });

  return matches;
}

function detectFramework(files) {
  const packageJsonPath = path.join(ROOT, "package.json");
  const packageJson = fs.existsSync(packageJsonPath)
    ? JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
    : {};

  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const framework = [];

  if (deps.next) framework.push("Next.js");
  if (deps.react) framework.push("React");
  if (deps.vite) framework.push("Vite");
  if (deps.tailwindcss) framework.push("Tailwind CSS");
  if (deps["@shopify/hydrogen"]) framework.push("Shopify Hydrogen");
  if (deps.stripe) framework.push("Stripe");
  if (deps["@supabase/supabase-js"]) framework.push("Supabase");

  if (files.some((f) => rel(f).startsWith("app/"))) framework.push("App Router detected");
  if (files.some((f) => rel(f).startsWith("pages/"))) framework.push("Pages Router detected");

  return [...new Set(framework)];
}

function findLikelyProductFiles(files) {
  const strongSignals = [
    "products",
    "product",
    "collection",
    "inventory",
    "catalog",
    "data"
  ];

  return files
    .map((file) => {
      const content = safeRead(file);
      const relative = rel(file);
      const lowerPath = relative.toLowerCase();
      const lowerContent = content.toLowerCase();

      let score = 0;

      strongSignals.forEach((sig) => {
        if (lowerPath.includes(sig)) score += 5;
        if (lowerContent.includes(sig)) score += 2;
      });

      if (lowerContent.includes("price")) score += 4;
      if (lowerContent.includes("₹")) score += 6;
      if (lowerContent.includes("size")) score += 2;
      if (lowerContent.includes("add to cart")) score += 4;
      if (lowerContent.includes("collection")) score += 3;
      if (lowerContent.includes("slug")) score += 3;
      if (lowerContent.includes("image")) score += 2;

      return { file: relative, score };
    })
    .filter((x) => x.score >= 8)
    .sort((a, b) => b.score - a.score);
}

function findThemeFiles(files) {
  const themeSignals = [
    "tailwind.config",
    "globals.css",
    "global.css",
    "theme",
    "colors",
    "layout",
    "styles"
  ];

  return files
    .map((file) => {
      const content = safeRead(file);
      const relative = rel(file);
      const lowerPath = relative.toLowerCase();
      const lowerContent = content.toLowerCase();

      let score = 0;

      themeSignals.forEach((sig) => {
        if (lowerPath.includes(sig)) score += 5;
        if (lowerContent.includes(sig)) score += 2;
      });

      if (lowerContent.includes("--")) score += 3;
      if (lowerContent.includes("background")) score += 2;
      if (lowerContent.includes("font-family")) score += 2;
      if (lowerContent.includes("#")) score += 2;

      return { file: relative, score };
    })
    .filter((x) => x.score >= 6)
    .sort((a, b) => b.score - a.score);
}

function collectRoutes(files) {
  return files
    .filter((file) => {
      const r = rel(file);
      return (
        r.includes("/page.") ||
        r.includes("/route.") ||
        r.includes("pages/") ||
        r.includes("app/")
      );
    })
    .map(rel)
    .sort();
}

function packageInfo() {
  const file = path.join(ROOT, "package.json");

  if (!fs.existsSync(file)) {
    return null;
  }

  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));

  return {
    name: pkg.name,
    scripts: pkg.scripts,
    dependencies: Object.keys(pkg.dependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {})
  };
}

function main() {
  const files = walk(ROOT);
  const framework = detectFramework(files);
  const likelyProductFiles = findLikelyProductFiles(files);
  const likelyThemeFiles = findThemeFiles(files);
  const routes = collectRoutes(files);

  const keywordReport = [];

  files.forEach((file) => {
    const content = safeRead(file);
    const matches = lineMatches(content);

    if (matches.length > 0) {
      keywordReport.push({
        file: rel(file),
        matches: matches.slice(0, 30)
      });
    }
  });

  const report = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    package: packageInfo(),
    detectedFramework: framework,
    totalScannedFiles: files.length,
    likelyProductFiles,
    likelyThemeFiles,
    routes,
    keywordReport
  };

  const outputPath = path.join(ROOT, "site-audit-report.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

  const readablePath = path.join(ROOT, "site-audit-summary.txt");

  const readable = [
    "SITE AUDIT SUMMARY",
    "==================",
    "",
    `Generated: ${report.generatedAt}`,
    `Root: ${ROOT}`,
    "",
    "Detected framework:",
    framework.length ? framework.map((x) => `- ${x}`).join("\n") : "- Unknown",
    "",
    "Likely product/data files:",
    likelyProductFiles.length
      ? likelyProductFiles.slice(0, 20).map((x) => `- ${x.file} | score: ${x.score}`).join("\n")
      : "- None found",
    "",
    "Likely theme/style files:",
    likelyThemeFiles.length
      ? likelyThemeFiles.slice(0, 20).map((x) => `- ${x.file} | score: ${x.score}`).join("\n")
      : "- None found",
    "",
    "Routes/files:",
    routes.length ? routes.map((x) => `- ${x}`).join("\n") : "- None found",
    "",
    "Package scripts:",
    report.package?.scripts
      ? Object.entries(report.package.scripts).map(([k, v]) => `- ${k}: ${v}`).join("\n")
      : "- package.json not found",
    "",
    "Top keyword hits:",
    keywordReport
      .slice(0, 40)
      .map((item) => {
        return [
          `\nFILE: ${item.file}`,
          ...item.matches.slice(0, 10).map((m) => `  ${m.lineNumber}: ${m.text}`)
        ].join("\n");
      })
      .join("\n")
  ].join("\n");

  fs.writeFileSync(readablePath, readable, "utf8");

  console.log("Audit complete.");
  console.log("Created:");
  console.log("- site-audit-report.json");
  console.log("- site-audit-summary.txt");
}

main();
``