# ============================================================================
#  ROSE & CO - FINAL GO-LIVE PATCH
#    A) Write a clean, compile-verified HeroSlideshow.tsx (fixes the build)
#    B) Write valid public/llms.txt (Agentic 3/3)
#    C) Remove unused Google Fonts preconnects from layout.tsx (if present)
#    D) Commit + push -> Vercel auto-deploys
#
#  Run from project root. Backs up every touched file to <file>.backup.
# ============================================================================

$ErrorActionPreference = "Stop"
function Say($m,$c="White"){ Write-Host $m -ForegroundColor $c }
if (-not (Test-Path "package.json")) { Say "ERROR: run from project root (where package.json is)." Red; exit 1 }

function BackupOnce($path){
  if ((Test-Path -LiteralPath $path) -and -not (Test-Path -LiteralPath "$path.backup")) {
    Copy-Item -LiteralPath $path -Destination "$path.backup" -Force
  }
}
function WriteFile($path,$content){
  BackupOnce $path
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { [System.IO.Directory]::CreateDirectory((Join-Path (Get-Location) $dir)) | Out-Null }
  [System.IO.File]::WriteAllText((Join-Path (Get-Location) $path), $content)
  Say "  [ok] wrote $path" Green
}
function PatchFile($path,$find,$replace,$label){
  if (-not (Test-Path -LiteralPath $path)) { Say "  [warn] $path not found ($label)" Red; return }
  BackupOnce $path
  $t = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $path))
  if ($t.Contains($find)) {
    $t = $t.Replace($find,$replace)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $path), $t)
    Say "  [ok] $label" Green
  } else { Say "  [skip] $label (not found / already done)" DarkYellow }
}

Say "=== FINAL GO-LIVE PATCH ===" Cyan

Say "A) HeroSlideshow.tsx (clean, compile-verified)" Yellow
$HERO = @'
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { inr } from '@/lib/format';

interface Slide {
  slug: string;
  name: string;
  hero: string;
  price: number;
  mrp: number;
  tagline: string;
  title: string;
  sub: string;
}

export default function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative bg-blush/40 overflow-hidden">
      {slides.map((slide, i) => {
        const firstName = slide.name.split(' ')[0];
        const discount = slide.mrp > slide.price
          ? Math.round(((slide.mrp - slide.price) / slide.mrp) * 100)
          : 0;
        return (
          <div
            key={slide.slug}
            className={`transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
            aria-hidden={i === index ? undefined : true}
          >
            <div className="container-x grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
              {/* Copy */}
              <div className="order-2 md:order-1">
                <p className="text-xs uppercase tracking-[0.3em] text-wine mb-4">
                  {slide.tagline}
                </p>
                <h1 className="font-display text-4xl md:text-6xl text-espresso leading-[1.05] whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="text-espresso/80 leading-relaxed mt-5 max-w-md">
                  {slide.sub}
                </p>

                <div className="flex items-baseline gap-3 mt-6">
                  <span className="text-2xl text-wine font-medium">{inr(slide.price)}</span>
                  {slide.mrp > slide.price && (
                    <>
                      <span className="text-lg text-espresso/40 line-through">{inr(slide.mrp)}</span>
                      {discount > 0 && (
                        <span className="text-xs uppercase tracking-widest bg-wine text-ivory px-2 py-1">
                          {discount}% off
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <Link href={`/product/${slide.slug}`} className="btn-primary" prefetch>
                    Shop the {firstName}
                  </Link>
                  <Link href="/shop" className="btn-secondary">
                    See the collection
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 md:order-2 relative aspect-[3/4] w-full">
                <Image
                  src={slide.hero}
                  alt={slide.name}
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 pb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1 rounded-full transition-all ${
                i === index ? 'bg-wine w-8' : 'bg-espresso/30 w-4'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
'@
WriteFile "src/components/HeroSlideshow.tsx" $HERO

Say "B) public/llms.txt" Yellow
$LLMS = @'
# Rose & Co

> Small-batch, hand-painted marble swirl satin co-ord sets. Ships from Gurugram, India in 24-48 hours. Free shipping across India, 7-day returns.

## Products
- [Amara Marble Swirl Co-ord Set](https://rose-and-co.vercel.app/product/amara-marble-swirl-coord-set): Crop top and high-waist midi skirt in hand-painted satin, 95-105 GSM.
- [Aarna Beige Marble Swirl Co-ord Set](https://rose-and-co.vercel.app/product/aarna-beige-marble-swirl-coord-set): Relaxed shirt and wide-leg pants in warm beige marble swirl satin.

## Guides
- [Journal](https://rose-and-co.vercel.app/journal): Guides on satin fabric, GSM, fit, and styling.
- [FAQ](https://rose-and-co.vercel.app/faq): Shipping, sizing, payment, and returns.

## Shop
- [Shop all](https://rose-and-co.vercel.app/shop): The full collection.

## Contact
- Email: care@roseandco.in
'@
WriteFile "public/llms.txt" $LLMS

Say "C) Remove unused font preconnects (layout.tsx, if present)" Yellow
$L = "src/app/layout.tsx"
PatchFile $L '<link rel="preconnect" href="https://fonts.googleapis.com" />' '' "googleapis preconnect a"
PatchFile $L '<link rel="preconnect" href="https://fonts.googleapis.com"/>' '' "googleapis preconnect b"
PatchFile $L '<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />' '' "gstatic preconnect a"
PatchFile $L '<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>' '' "gstatic preconnect b"

Say "D) Ignore local artifacts so they don't get committed" Yellow
if (-not (Select-String -Path ".gitignore" -Pattern "AUDIT" -Quiet -ErrorAction SilentlyContinue)) {
  Add-Content ".gitignore" "`n*.backup`n*-AUDIT.ps1`nsite-audit*.txt`nrose-audit.txt`nwake-neon.ts"
  Say "  [ok] updated .gitignore" Green
} else { Say "  [skip] .gitignore already has entries" DarkYellow }

Say ""
Say "Building to verify before deploy..." Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  Say "BUILD FAILED - not pushing. Paste the error and we fix before going live." Red
  exit 1
}

Say ""
Say "Build green. Committing + pushing (Vercel will auto-deploy)..." Cyan
git add public/llms.txt src/app/layout.tsx src/components/HeroSlideshow.tsx .gitignore
git commit -m "Fix Hero build, valid llms.txt, drop unused font preconnects"
git push origin main

Say ""
Say "DONE. Watch Vercel -> Deployments for the green Ready status (~1 min)." Cyan
