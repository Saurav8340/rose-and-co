# ============================================================================
#  ROSE & CO - FULL SITE AUDIT
#  Scans every code + content file and writes ONE report: site-audit.txt
#  Then split-safe: also writes site-audit-part1.txt ... in ~180KB chunks so
#  you can paste them back here even if the whole thing is large.
#
#  SAFE: never includes .env / secrets / node_modules / .next / .git.
#  Run from your project root (folder with package.json).
# ============================================================================

$ErrorActionPreference = "Stop"
function Say($m,$c="White"){ Write-Host $m -ForegroundColor $c }

if (-not (Test-Path "package.json")) { Say "ERROR: run from project root (where package.json is)." Red; exit 1 }

$OUT = "site-audit.txt"
$exclude = '\\node_modules\\|\\\.next\\|\\\.git\\|\\dist\\|\\build\\|\\\.vercel\\'
$codeExt = @(".ts",".tsx",".js",".jsx",".md",".mdx",".prisma",".css",".json")

# collect files (code + content), excluding heavy/secret dirs
$files = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $codeExt -contains $_.Extension -and $_.FullName -notmatch $exclude -and $_.Name -ne "package-lock.json" }

Say "Scanning $($files.Count) files..." Cyan

$sb = New-Object System.Text.StringBuilder
function Add($t){ [void]$sb.AppendLine($t) }

Add "===== ROSE & CO FULL SITE AUDIT ====="
Add "Date: $(Get-Date)"
Add "Files scanned: $($files.Count)"
Add ""

# ---- A. PROJECT META ----
Add "===== A. PROJECT META ====="
Add "--- package.json ---"
Add (Get-Content "package.json" -Raw)
Add "--- prisma schema (models) ---"
if (Test-Path "prisma/schema.prisma") { Add (Get-Content "prisma/schema.prisma" -Raw) }
Add ""

# ---- B. FILE INVENTORY with line counts + sizes ----
Add "===== B. FILE INVENTORY (path | lines | KB) ====="
foreach ($f in ($files | Sort-Object FullName)) {
  $rel = $f.FullName.Substring((Get-Location).Path.Length + 1)
  $lines = (Get-Content -LiteralPath $f.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
  $kb = [math]::Round($f.Length/1KB,1)
  Add ("{0} | {1} | {2}KB" -f $rel, $lines, $kb)
}
Add ""

# ---- C. RED-FLAG SCANS ----
Add "===== C. RED-FLAG SCANS ====="
function Scan($label,$pattern){
  Add "--- $label ---"
  $hits = $files | Select-String -Pattern $pattern -ErrorAction SilentlyContinue |
    ForEach-Object { $rel = $_.Path.Substring((Get-Location).Path.Length + 1); "${rel}:$($_.LineNumber): $($_.Line.Trim())" }
  if ($hits) { $hits | Select-Object -First 60 | ForEach-Object { Add $_ } } else { Add "(none)" }
  Add ""
}
Scan "Leftover console.log" "console\.log"
Scan "TODO / FIXME / HACK" "TODO|FIXME|HACK|XXX"
Scan "Hardcoded price numbers" "1900|2000|2199|2299|2999"
Scan "Old 'skirt' / 'crop top' copy" "midi skirt|crop top|A-line skirt"
Scan "Possible any-types (TS looseness)" ": any\b"
Scan "Dangerous innerHTML" "dangerouslySetInnerHTML"
Scan "Missing image alt (img with no alt)" "<img (?![^>]*alt=)"
Scan "Inline TODO price/stock placeholders" "PLACEHOLDER|CHANGEME|lorem"
Scan "Meta / SEO title fields" "export const metadata|<title|seoTitle|description:"
Scan "CTA buttons text" "Add to Bag|Buy Now|Checkout|Add to Cart"
Scan "Error handling gaps (empty catch)" "catch\s*\{\s*\}"

# ---- D. FULL CONTENT DUMP ----
Add "===== D. FULL CONTENT DUMP ====="
foreach ($f in ($files | Sort-Object FullName)) {
  $rel = $f.FullName.Substring((Get-Location).Path.Length + 1)
  Add "----- FILE: $rel -----"
  Add (Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue)
  Add ""
}
Add "===== END ====="

# write full file
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $OUT), $sb.ToString())
$size = [math]::Round((Get-Item $OUT).Length/1KB,0)
Say "Wrote $OUT ($size KB)" Green

# ---- split into ~180KB chunks for easy pasting ----
$text = $sb.ToString()
$chunk = 180000
if ($text.Length -gt $chunk) {
  $parts = [math]::Ceiling($text.Length / $chunk)
  for ($i=0; $i -lt $parts; $i++) {
    $slice = $text.Substring($i*$chunk, [math]::Min($chunk, $text.Length - $i*$chunk))
    $name = "site-audit-part$($i+1).txt"
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $name), $slice)
    Say "  wrote $name" DarkYellow
  }
  Say "Paste the part files back in order (part1, part2, ...)." Cyan
} else {
  Say "Small enough to paste in one go: open $OUT, copy all, paste back." Cyan
}
