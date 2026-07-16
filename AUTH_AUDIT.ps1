# ============================================================
# AUTH AUDIT - finds the 2 values needed to lock the admin APIs.
# Run from your project root. Paste the output back to confirm the settings.
# It does NOT print any secret values, only the NAMES it finds.
# ============================================================

$out = "auth-audit.txt"
"===== AUTH AUDIT =====" | Set-Content $out
"Date: $(Get-Date)" | Add-Content $out
"" | Add-Content $out

"===== 1. LOGIN ROUTE (how the admin cookie is set) =====" | Add-Content $out
Get-Content "src/app/api/admin/login/route.ts" -ErrorAction SilentlyContinue | Add-Content $out

"" | Add-Content $out
"===== 2. COOKIE NAMES referenced anywhere =====" | Add-Content $out
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue |
  Select-String -Pattern "cookies\(\)","\.set\(","\.get\(","cookie" -ErrorAction SilentlyContinue |
  Select-Object -First 40 | ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" } | Add-Content $out

"" | Add-Content $out
"===== 3. JWT SECRET env var NAME (value hidden) =====" | Add-Content $out
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx -ErrorAction SilentlyContinue |
  Select-String -Pattern "process.env" -ErrorAction SilentlyContinue |
  Where-Object { $_.Line -match "SECRET|JWT|TOKEN|AUTH" } |
  Select-Object -First 20 | ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" } | Add-Content $out

"" | Add-Content $out
"===== 4. env var NAMES in .env.example (names only, no values) =====" | Add-Content $out
Get-Content ".env.example" -ErrorAction SilentlyContinue | ForEach-Object { ($_ -split "=")[0] } | Add-Content $out

"" | Add-Content $out
"===== 5. MIDDLEWARE (what paths are protected) =====" | Add-Content $out
Get-Content "src/middleware.ts" -ErrorAction SilentlyContinue | Add-Content $out

"" | Add-Content $out
"===== 6. Your prisma import (match this in new files) =====" | Add-Content $out
Get-Content "src/app/api/products/by-ids/route.ts" -ErrorAction SilentlyContinue |
  Select-Object -First 6 | Add-Content $out
"--- lib files ---" | Add-Content $out
Get-ChildItem -Path src/lib -Include *.ts -Recurse -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty Name | Add-Content $out

"" | Add-Content $out
"===== END =====" | Add-Content $out
Write-Host "DONE - open auth-audit.txt, copy everything, paste it back." -ForegroundColor Green
