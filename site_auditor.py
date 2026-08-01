#!/usr/bin/env python3
"""
site_auditor.py  —  Full-stack website auditor for code, security, SEO/GEO/AEO,
performance (Core Web Vitals signals) and CRO / marketing (Sales, ROAS, CTR, CVR).

Runs on plain Python 3.8+. No pip installs. No internet. Point it at your project
folder (the one open in VS Code) and it writes a ranked HTML report + JSON.

USAGE
    python site_auditor.py .                         # audit current folder
    python site_auditor.py "C:/path/to/my-site"      # audit a specific folder
    python site_auditor.py . --out audit_report.html # custom output name
    python site_auditor.py . --open                  # auto-open report in browser

Author: built for Saurav (performance-marketing operator build)
"""

import os, re, sys, json, html, argparse, webbrowser
from datetime import datetime
from collections import defaultdict, Counter

# ------------------------------------------------------------------ config
IGNORE_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "vendor", ".cache",
    "__pycache__", ".venv", "venv", "coverage", ".idea", ".vscode", "out",
    "bower_components", ".parcel-cache", ".turbo", "tmp", ".output"
}
CODE_EXT   = {".html",".htm",".php",".js",".jsx",".ts",".tsx",".vue",".svelte",
              ".css",".scss",".py",".rb",".env",".json",".txt",".astro",".mjs",".cjs"}
IMG_EXT    = {".jpg",".jpeg",".png",".gif",".bmp",".tiff",".webp",".avif",".svg"}
MAX_FILE_MB = 3          # skip files larger than this (build artifacts etc.)
BIG_IMG_KB  = 250        # flag raster images bigger than this

SEV_ORDER = {"CRITICAL":0,"HIGH":1,"MEDIUM":2,"LOW":3,"INFO":4}
SEV_COLOR = {"CRITICAL":"#E30613","HIGH":"#ff6b35","MEDIUM":"#f4a300",
             "LOW":"#3a7bd5","INFO":"#7a7a7a"}

findings = []  # each: dict(id, sev, cat, impact[list], title, detail, file, line, fix, effort)

def add(sev, cat, impact, title, detail, fix, effort="S", file="", line=0):
    findings.append({
        "sev":sev, "cat":cat, "impact":impact, "title":title, "detail":detail,
        "fix":fix, "effort":effort, "file":file, "line":line
    })

# ------------------------------------------------------------------ helpers
def rel(root, path): return os.path.relpath(path, root).replace("\\","/")

def read(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""

def find_line(text, idx):
    return text.count("\n", 0, idx) + 1

# Real <head> tag only — NOT <header>. Fixes false positives on React/Next components.
HEAD_RE = re.compile(r"<head[\s>]", re.I)
def has_head(text): return bool(HEAD_RE.search(text))

# ---- framework awareness (set during run) ----
FW = {"is_next": False, "is_react": False, "has_metadata_api": False,
      "has_jsonld": False, "has_gitignore": False}

# ------------------------------------------------------------------ SECURITY SCANNERS
SECRET_PATTERNS = [
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
    (r"(?i)aws_secret_access_key\s*[:=]\s*['\"][^'\"]{20,}", "AWS secret key"),
    (r"AIza[0-9A-Za-z_\-]{35}", "Google API key"),
    (r"sk_live_[0-9a-zA-Z]{20,}", "Stripe LIVE secret key"),
    (r"sk_test_[0-9a-zA-Z]{20,}", "Stripe test secret key"),
    (r"ghp_[0-9A-Za-z]{36}", "GitHub personal token"),
    (r"xox[baprs]-[0-9A-Za-z\-]{10,}", "Slack token"),
    (r"EAA[0-9A-Za-z]{20,}", "Meta/Facebook access token"),
    (r"-----BEGIN (RSA|EC|OPENSSH|PRIVATE) ?KEY-----", "Private key block"),
    (r"(?i)(password|passwd|pwd|secret|api[_-]?key|token)\s*[:=]\s*['\"][^'\"\s]{6,}['\"]",
     "Hard-coded credential"),
]

DANGEROUS_JS = [
    (r"\beval\s*\(", "Use of eval() — arbitrary code execution / XSS vector"),
    (r"\.innerHTML\s*=", "innerHTML assignment — DOM-based XSS if data is untrusted"),
    (r"document\.write\s*\(", "document.write — blocks rendering + XSS risk"),
    (r"dangerouslySetInnerHTML", "React dangerouslySetInnerHTML — sanitize input"),
    (r"new Function\s*\(", "new Function() — dynamic code execution"),
    (r"(?i)v-html\s*=", "Vue v-html — renders raw HTML, XSS risk"),
]

PHP_SQLI = [
    (r"(?i)(select|insert|update|delete).{0,40}\$_(GET|POST|REQUEST)", "SQL query uses raw request input (SQL injection)"),
    (r"mysql_query\s*\(", "Deprecated mysql_query — use PDO/mysqli prepared statements"),
    (r"(?i)echo\s+\$_(GET|POST|REQUEST)", "Echoing request input directly — reflected XSS"),
]

def scan_security(path, text, rp):
    low = text
    for pat, label in SECRET_PATTERNS:
        for m in re.finditer(pat, low):
            add("CRITICAL","Security",["Security"],
                f"Exposed secret: {label}",
                f"A credential-like string was found in source. If this is a real key it can be "
                f"stolen from your repo/bundle and abused (billing fraud, data theft).",
                "Move it to an environment variable / server-side only. Rotate the key now. "
                "Add the file to .gitignore. Never ship secrets in client JS.",
                "S", rp, find_line(text, m.start()))
    ext = os.path.splitext(path)[1].lower()
    if ext in {".js",".jsx",".ts",".tsx",".vue",".svelte",".html",".htm",".astro"}:
        base = os.path.basename(path).lower()
        for pat, label in DANGEROUS_JS:
            for m in re.finditer(pat, text):
                sev, detail, fix = "HIGH", \
                    "Untrusted data reaching this sink can execute scripts in your users' browsers.", \
                    "Sanitize/escape input, prefer textContent, or use a trusted templating layer."
                # Context-aware downgrade for the legitimate Next.js JSON-LD pattern.
                if "dangerouslySetInnerHTML" in pat:
                    ctx = text[max(0,m.start()-160):m.start()+220]
                    if ("jsonld" in base or "json-ld" in base
                        or "application/ld+json" in ctx.lower()
                        or "JSON.stringify" in ctx):
                        sev = "INFO"
                        detail = ("This is the standard Next.js pattern for injecting JSON-LD "
                                  "structured data from a trusted, server-built object — low risk.")
                        fix = ("Fine as-is if the object is server-built. Only escape < in the "
                               "JSON string if any field can contain user input.")
                add(sev,"Security",["Security"], label, detail, fix,
                    "M", rp, find_line(text, m.start()))
    if ext == ".php":
        for pat, label in PHP_SQLI:
            for m in re.finditer(pat, text):
                add("CRITICAL" if "injection" in label.lower() else "HIGH","Security",["Security"],
                    label,
                    "Raw user input is used in a query/output without sanitization.",
                    "Use prepared statements (PDO/mysqli) and htmlspecialchars() on output.",
                    "M", rp, find_line(text, m.start()))
    # committed .env
    if os.path.basename(path) == ".env":
        add("CRITICAL","Security",["Security"],
            ".env file present in project",
            "If this folder is a git repo and .env is tracked, all secrets leak on push.",
            "Confirm .env is in .gitignore. Run `git rm --cached .env` if already committed.",
            "S", rp, 0)

def scan_html_security(text, rp):
    # target=_blank without rel=noopener  -> reverse tabnabbing
    for m in re.finditer(r"<a\b[^>]*target=['\"]_blank['\"][^>]*>", text, re.I):
        if "noopener" not in m.group(0).lower():
            add("MEDIUM","Security",["Security"],
                "target=\"_blank\" without rel=\"noopener\"",
                "Opened page can access window.opener and redirect your tab (tabnabbing).",
                'Add rel="noopener noreferrer" to external target=_blank links.',
                "S", rp, find_line(text, m.start()))
    # mixed content
    for m in re.finditer(r"(src|href)=['\"]http://", text, re.I):
        add("MEDIUM","Security",["Security","SEO"],
            "Insecure http:// resource (mixed content)",
            "Browsers block or warn on http assets loaded from an https page.",
            "Change to https:// (or protocol-relative //). Serve everything over TLS.",
            "S", rp, find_line(text, m.start()))
    # CSP / security headers hint
    if has_head(text) and "content-security-policy" not in text.lower():
        add("LOW","Security",["Security"],
            "No Content-Security-Policy detected",
            "A CSP is one of the strongest defenses against XSS and injected scripts.",
            "Add a CSP via server header or <meta http-equiv> once you know your asset origins.",
            "M", rp, 0)

# outdated CDN libs (rough)
OLD_LIBS = [
    (r"jquery[/-]([12]\.\d+\.\d+)", "jQuery {v} is old — known XSS/proto issues; upgrade to 3.7+"),
    (r"bootstrap[/-](3\.\d+\.\d+)", "Bootstrap {v} is EOL — upgrade to 5.x"),
    (r"angular\.js/(1\.\d+\.\d+)", "AngularJS {v} is end-of-life — migrate framework"),
]
def scan_libs(text, rp):
    for pat, msg in OLD_LIBS:
        for m in re.finditer(pat, text, re.I):
            add("HIGH","Upgrade",["Security","Performance"],
                "Outdated front-end library",
                msg.replace("{v}", m.group(1)),
                "Update to a supported major version and re-test.",
                "M", rp, find_line(text, m.start()))

# ------------------------------------------------------------------ SEO / GEO / AEO
def scan_seo(text, rp):
    t = text.lower()
    # Skip SEO/head checks on files with no real <head>. In Next.js App Router the
    # metadata (title/description/canonical/OG/viewport) lives in metadata exports,
    # not <head> — so we only audit files that actually render a <head>.
    if not has_head(text):
        return
    # In Next.js, if the project uses the Metadata API, title/description/canonical/OG
    # are injected server-side and viewport is auto-added — so we skip those checks here.
    meta_handled = FW["is_next"] and FW["has_metadata_api"]
    if meta_handled:
        # still useful signal, but demote to INFO so it doesn't tank the score
        add("INFO","SEO",["SEO"],
            "Next.js Metadata API in use — verify per-route metadata",
            "This file renders <head> but the project uses the metadata export API. "
            "Confirm each route/page defines its own title, description, canonical and OG image.",
            "Ensure every page.tsx exports `metadata` (or generateMetadata) with unique values.",
            "S", rp, 0)
        return
    # title
    tm = re.search(r"<title[^>]*>(.*?)</title>", text, re.I|re.S)
    if not tm or not tm.group(1).strip():
        add("HIGH","SEO",["CTR","SEO"],
            "Missing or empty <title>",
            "Title is the #1 on-page ranking + click factor. No title = weak SERP CTR.",
            "Add a unique 50–60 char title with the primary keyword near the front.","S",rp,0)
    else:
        ln = len(tm.group(1).strip())
        if ln > 65 or ln < 15:
            add("MEDIUM","SEO",["CTR","SEO"],
                f"Title length {ln} chars is off-target",
                "Titles ~50–60 chars display fully in Google and win more clicks (CTR).",
                "Rewrite title to 50–60 chars, front-load the keyword and a benefit.","S",rp,0)
    # meta description
    if not re.search(r'<meta[^>]+name=["\']description["\']', text, re.I):
        add("HIGH","SEO",["CTR","SEO"],
            "Missing meta description",
            "No description = Google auto-picks snippet = lower, less persuasive SERP CTR.",
            "Add a 140–160 char description with a benefit + implicit CTA.","S",rp,0)
    # canonical
    if not re.search(r'rel=["\']canonical["\']', text, re.I):
        add("LOW","SEO",["SEO"],
            "No canonical tag",
            "Prevents duplicate-content dilution across URL variants.",
            'Add <link rel="canonical" href="…"> to each page.',"S",rp,0)
    # og / twitter
    if not re.search(r'property=["\']og:', text, re.I):
        add("MEDIUM","SEO",["CTR","Sales"],
            "No Open Graph tags",
            "Links shared on FB/IG/WhatsApp/LinkedIn render as bare URLs — kills social CTR.",
            "Add og:title, og:description, og:image (1200×630). Directly lifts shared-link CTR.","S",rp,0)
    # structured data (GEO/AEO — gets you cited by AI + rich results)
    if "application/ld+json" not in t and not FW["has_jsonld"]:
        add("HIGH","SEO",["SEO","CTR","Sales"],
            "No JSON-LD structured data (schema.org)",
            "Structured data drives rich results (stars, price, FAQ) AND makes you far more "
            "likely to be cited by AI answer engines (GEO/AEO). Both raise qualified clicks.",
            "Add Product / Organization / FAQ / Review schema as JSON-LD.","M",rp,0)
    # h1
    h1 = len(re.findall(r"<h1\b", text, re.I))
    if h1 == 0:
        add("MEDIUM","SEO",["SEO"],"No <h1> heading",
            "Search engines use H1 to understand the page's main topic.",
            "Add exactly one descriptive H1 per page.","S",rp,0)
    elif h1 > 1:
        add("LOW","SEO",["SEO"],f"{h1} <h1> tags on one page",
            "Multiple H1s dilute topical clarity.","Keep a single H1; use H2/H3 below it.","S",rp,0)
    # viewport (mobile = most ad traffic)
    if not re.search(r'name=["\']viewport["\']', text, re.I):
        add("HIGH","Performance",["CVR","CTR","ROAS"],
            "Missing mobile viewport meta",
            "Most paid traffic is mobile. No viewport = broken layout = wasted ad spend, low CVR.",
            '<meta name="viewport" content="width=device-width, initial-scale=1">',"S",rp,0)
    # alt text coverage
    imgs = re.findall(r"<img\b[^>]*>", text, re.I)
    noalt = [i for i in imgs if not re.search(r'\balt=', i, re.I)]
    if imgs and len(noalt) > 0:
        add("LOW","SEO",["SEO"],
            f"{len(noalt)}/{len(imgs)} <img> tags missing alt text",
            "Alt text feeds image SEO and accessibility.",
            "Add descriptive alt to every meaningful image.","S",rp,0)

# ------------------------------------------------------------------ PERFORMANCE / CWV
def scan_perf(text, rp):
    t = text.lower()
    if not has_head(text): return
    # render-blocking scripts in head w/o defer/async
    head = text[:text.lower().find("</head>")] if "</head>" in t else text
    for m in re.finditer(r"<script\b[^>]*src=[^>]*>", head, re.I):
        tag = m.group(0)
        if "async" not in tag.lower() and "defer" not in tag.lower():
            add("MEDIUM","Performance",["CVR","ROAS","CTR"],
                "Render-blocking script in <head>",
                "Blocks first paint → slower LCP → higher bounce → lower Quality Score/ROAS.",
                "Add defer (or async) to non-critical scripts, or move them before </body>.","S",
                rp, find_line(text, m.start()))
    # images without width/height (CLS)
    for m in re.finditer(r"<img\b[^>]*>", text, re.I):
        tag = m.group(0)
        if not (re.search(r"\bwidth=", tag, re.I) and re.search(r"\bheight=", tag, re.I)):
            add("LOW","Performance",["CVR"],
                "Image without width/height (layout shift)",
                "Missing dimensions cause CLS — content jumps, users mis-tap, CVR drops.",
                "Set explicit width & height (or CSS aspect-ratio) on images.","S",
                rp, find_line(text, m.start()))
    # no lazy loading
    imgs = re.findall(r"<img\b[^>]*>", text, re.I)
    if imgs and not any("loading=" in i.lower() for i in imgs):
        add("LOW","Performance",["CVR","ROAS"],
            "Images not lazy-loaded",
            "Eager-loading below-fold images slows LCP and wastes bandwidth.",
            'Add loading="lazy" to below-the-fold images.',"S",rp,0)
    # large inline blocks
    for m in re.finditer(r"<style\b[^>]*>(.*?)</style>", text, re.I|re.S):
        if len(m.group(1)) > 4000:
            add("LOW","Performance",["CVR"],
                "Large inline <style> block",
                "Big inline CSS bloats HTML and delays parsing.",
                "Extract to an external, minified, cacheable .css file.","M",rp,find_line(text,m.start()))

def scan_image_file(path, rp):
    ext = os.path.splitext(path)[1].lower()
    if ext in {".svg"}: return
    try: kb = os.path.getsize(path)/1024
    except OSError: return
    if ext in {".jpg",".jpeg",".png",".gif"} and kb > BIG_IMG_KB:
        add("MEDIUM","Performance",["CVR","ROAS","CTR"],
            f"Heavy image {kb:.0f} KB ({ext})",
            "Large images are the #1 cause of slow LCP. Slow pages = lower conversion, "
            "higher CPC/CPA, worse ad Quality Score → lower ROAS.",
            "Compress and convert to WebP/AVIF; serve responsive sizes with srcset. "
            "Target < 150 KB for hero, < 80 KB for supporting images.","S", rp, 0)

# ------------------------------------------------------------------ CRO / MARKETING (the money layer)
# Aggregated across the whole site, not per-file
site_signals = {
    "ga4": False, "gtm": False, "meta_pixel": False, "capi_eventid": False,
    "tiktok": False, "google_ads": False, "linkedin": False,
    "cta_count": 0, "form_count": 0, "form_fields_max": 0,
    "trust_hits": 0, "review_schema": False, "sticky_cta": False,
    "ab_test": False, "html_pages": 0, "consent": False, "og": False,
}
TRUST_WORDS = ["testimonial","review","rating","trustpilot","guarantee","money-back",
               "refund","secure checkout","ssl","verified","as seen on","warranty",
               "free shipping","30-day","satisfaction"]

def scan_marketing(text, rp):
    t = text.lower()
    if "<html" in t or "<!doctype" in t: site_signals["html_pages"] += 1
    if re.search(r"gtag\(|googletagmanager\.com/gtag|G-[A-Z0-9]{8,}", text): site_signals["ga4"]=True
    if "googletagmanager.com/gtm" in t or "gtm-" in t: site_signals["gtm"]=True
    if "fbq(" in t or "connect.facebook.net" in t or "meta pixel" in t: site_signals["meta_pixel"]=True
    if "eventid" in t or "event_id" in t: site_signals["capi_eventid"]=True
    if "ttq." in t or "analytics.tiktok.com" in t: site_signals["tiktok"]=True
    if "googleadservices" in t or "aw-" in t or "conversion_id" in t: site_signals["google_ads"]=True
    # Next.js-native analytics patterns (@next/third-parties, next/script, @vercel/analytics)
    if "googletagmanager" in t or "sendgtmevent" in t or "@next/third-parties" in t: site_signals["gtm"]=True
    if "sendgaevent" in t or "@vercel/analytics" in t or "next/script" in t and "gtag" in t: site_signals["ga4"]=True
    if "snap.licdn.com" in t or "_linkedin_partner_id" in t: site_signals["linkedin"]=True
    if "og:" in t: site_signals["og"]=True
    if any(w in t for w in ["cookieconsent","cookie-consent","gdpr","consent mode","onetrust"]):
        site_signals["consent"]=True
    if '"review"' in t or "aggregaterating" in t: site_signals["review_schema"]=True
    if "position:sticky" in t or "position: sticky" in t or "sticky-cta" in t: site_signals["sticky_cta"]=True
    if any(w in t for w in ["optimizely","vwo","ab-test","abtest","experiment","google optimize","posthog"]):
        site_signals["ab_test"]=True
    # CTA counting
    cta_words = ["buy now","add to cart","get started","sign up","subscribe","shop now",
                 "book now","order now","start free","claim","get quote","contact us","download"]
    for w in cta_words:
        site_signals["cta_count"] += t.count(w)
    site_signals["trust_hits"] += sum(1 for w in TRUST_WORDS if w in t)
    # forms & field count
    for fm in re.finditer(r"<form\b.*?</form>", text, re.I|re.S):
        site_signals["form_count"] += 1
        fields = len(re.findall(r"<input\b|<select\b|<textarea\b", fm.group(0), re.I))
        site_signals["form_fields_max"] = max(site_signals["form_fields_max"], fields)

def evaluate_marketing():
    s = site_signals
    if s["html_pages"] == 0:  # framework app, signals still valid
        pass
    # Tracking coverage — you can't optimize ROAS on data you don't collect
    if not s["ga4"] and not s["gtm"]:
        add("HIGH","Marketing",["ROAS","CVR"],
            "No GA4 / Google Tag Manager detected",
            "Without analytics you're flying blind — no funnel data, no audience building, "
            "no way to attribute spend. Every ROAS decision becomes a guess.",
            "Install GTM + GA4, define key events (view_item, add_to_cart, purchase/lead).","M")
    if not s["meta_pixel"]:
        add("HIGH","Marketing",["ROAS","CVR"],
            "No Meta Pixel detected",
            "No Pixel = Meta can't optimize delivery to buyers, can't build lookalikes, "
            "can't retarget. This directly caps ROAS on Meta spend.",
            "Add the Meta Pixel + standard events. Then add Conversions API for iOS/ad-block coverage.","M")
    elif not s["capi_eventid"]:
        add("MEDIUM","Marketing",["ROAS"],
            "Meta Pixel present but no event_id (no CAPI dedup)",
            "Browser Pixel loses 20–40% of events to iOS/ad-blockers. Without CAPI + event_id "
            "dedup you under-report conversions and the algorithm optimizes on partial data → lower ROAS.",
            "Send server-side Conversions API events with a shared event_id to dedupe against the Pixel.","M")
    if not s["google_ads"] and (s["ga4"] or s["meta_pixel"]):
        add("LOW","Marketing",["ROAS"],
            "No Google Ads conversion tag detected",
            "If you run/plan Google/YouTube, conversion tracking is required for Smart Bidding.",
            "Add the Google Ads conversion tag or import GA4 conversions.","S")
    # CRO structural
    if s["cta_count"] == 0:
        add("HIGH","Marketing",["CVR","Sales","CTR"],
            "No clear call-to-action text found",
            "If there's no obvious action, visitors don't convert. Ambiguous pages waste ad clicks.",
            "Add one primary, high-contrast CTA above the fold + repeat it down the page.","S")
    if s["form_fields_max"] >= 6:
        add("MEDIUM","Marketing",["CVR"],
            f"A form has {s['form_fields_max']}+ fields",
            "Every extra field cuts completion. Long forms are a top CVR killer for lead gen.",
            "Cut to essentials (often just email/phone). Use multi-step for the rest.","S")
    if s["trust_hits"] < 2:
        add("MEDIUM","Marketing",["CVR","Sales"],
            "Weak trust signals",
            "Few reviews/guarantees/badges found. Cold paid traffic needs proof to convert.",
            "Add testimonials, star ratings, a guarantee, and payment/security badges near CTAs.","M")
    if not s["review_schema"] and s["trust_hits"] > 0:
        add("LOW","Marketing",["CTR","SEO"],
            "Reviews on page but no Review/AggregateRating schema",
            "Marking up reviews can show ★ stars in search/ads → higher CTR at no extra spend.",
            "Add Review + AggregateRating JSON-LD.","S")
    if not s["sticky_cta"]:
        add("LOW","Marketing",["CVR"],
            "No sticky / persistent CTA detected",
            "A sticky buy/lead bar keeps the action in view on long/mobile pages, lifting CVR.",
            "Add a sticky bottom bar or header CTA on mobile.","S")
    if not s["ab_test"]:
        add("INFO","Marketing",["CVR","ROAS"],
            "No A/B testing tool detected",
            "Without experimentation you can't systematically raise CVR — you're guessing.",
            "Add a lightweight tester (PostHog/GrowthBook are free) and test hero, CTA, price framing.","M")
    if not s["consent"] and (s["ga4"] or s["meta_pixel"]):
        add("MEDIUM","Marketing",["ROAS"],
            "Trackers present but no consent/Consent-Mode detected",
            "Missing consent handling risks compliance issues and, with Google Consent Mode v2, "
            "degraded conversion modeling → weaker bidding.",
            "Add a consent banner wired to GTM Consent Mode v2.","M")

# ------------------------------------------------------------------ PROJECT-LEVEL CHECKS
def project_checks(root, all_files_rel):
    names = {os.path.basename(f).lower() for f in all_files_rel}
    if not any(n in names for n in ["robots.txt"]):
        add("LOW","SEO",["SEO"],"No robots.txt","Search engines lack crawl guidance.",
            "Add robots.txt with a Sitemap: line.","S")
    if not any("sitemap" in n for n in names):
        add("LOW","SEO",["SEO"],"No sitemap.xml","Slower/less complete indexing of your pages.",
            "Generate sitemap.xml and reference it in robots.txt.","S")
    # NOTE: extensionless dotfiles aren't in the walk list, so check the disk directly.
    if not FW["has_gitignore"] and os.path.isdir(os.path.join(root,".git")):
        add("HIGH","Security",["Security"],"Git repo without .gitignore",
            "Risk of committing secrets, .env, node_modules.",
            "Add a .gitignore covering .env, /node_modules, build output.","S")
    # dependency freshness (rough, offline)
    pkg = os.path.join(root, "package.json")
    if os.path.isfile(pkg):
        add("INFO","Upgrade",["Security","Performance"],
            "package.json present — run a dependency audit",
            "Offline scan can't check npm advisories, but outdated deps are a top vuln source.",
            "Run `npm audit` and `npm outdated`; update majors carefully and re-test.","M",
            "package.json", 0)

# ------------------------------------------------------------------ WALK
def walk(root):
    files, imgs = [], []
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in IGNORE_DIRS and not d.startswith(".")]
        for f in fn:
            p = os.path.join(dp, f)
            ext = os.path.splitext(f)[1].lower()
            try:
                if os.path.getsize(p) > MAX_FILE_MB*1024*1024 and ext not in IMG_EXT:
                    continue
            except OSError:
                continue
            if ext in CODE_EXT: files.append(p)
            elif ext in IMG_EXT: imgs.append(p)
    return files, imgs

def detect_framework(root, code_files):
    """One quick pre-pass to understand the stack so checks don't misfire."""
    FW["has_gitignore"] = os.path.isfile(os.path.join(root, ".gitignore"))
    pkg = os.path.join(root, "package.json")
    if os.path.isfile(pkg):
        pj = read(pkg).lower()
        if '"next"' in pj: FW["is_next"] = True
        if '"react"' in pj: FW["is_react"] = True
    # App Router / metadata API / JSON-LD component signals across source
    for p in code_files:
        t = read(p)
        low = t.lower()
        if re.search(r"export\s+(const|async\s+function)\s+(metadata|generateMetadata)", t) \
           or "export const metadata" in low or "generatemetadata" in low:
            FW["has_metadata_api"] = True
        if "application/ld+json" in low or os.path.basename(p).lower().startswith("jsonld"):
            FW["has_jsonld"] = True
        if "from 'next" in low or 'from "next' in low or "next/" in low:
            FW["is_next"] = True
    print(f"   stack: Next.js={FW['is_next']} React={FW['is_react']} "
          f"MetadataAPI={FW['has_metadata_api']} JSON-LD={FW['has_jsonld']} "
          f".gitignore={FW['has_gitignore']}")

def run_audit(root):
    code_files, img_files = walk(root)
    all_rel = [rel(root,p) for p in code_files+img_files]
    detect_framework(root, code_files)
    for p in code_files:
        rp = rel(root, p); text = read(p); ext = os.path.splitext(p)[1].lower()
        scan_security(p, text, rp)
        scan_libs(text, rp)
        scan_marketing(text, rp)
        if ext in {".html",".htm",".php",".vue",".jsx",".tsx",".svelte",".astro"}:
            scan_html_security(text, rp)
            scan_seo(text, rp)
            scan_perf(text, rp)
    for p in img_files:
        scan_image_file(p, rel(root,p))
    evaluate_marketing()
    project_checks(root, all_rel)
    return len(code_files), len(img_files)

# ------------------------------------------------------------------ REPORT
def score():
    w = {"CRITICAL":25,"HIGH":12,"MEDIUM":5,"LOW":2,"INFO":0}
    pen = sum(w[f["sev"]] for f in findings)
    return max(0, 100 - min(pen, 100))

def html_report(root, n_code, n_img, out):
    findings.sort(key=lambda f:(SEV_ORDER[f["sev"]], f["cat"]))
    by_sev = Counter(f["sev"] for f in findings)
    by_cat = Counter(f["cat"] for f in findings)
    by_imp = Counter(i for f in findings for i in f["impact"])
    sc = score()
    grade = ("A",  "#1db954") if sc>=85 else ("B","#8ac926") if sc>=70 else \
            ("C","#f4a300") if sc>=55 else ("D","#ff6b35") if sc>=40 else ("F","#E30613")
    # quick wins = high/critical impact + small effort
    quick = [f for f in findings if f["effort"]=="S" and f["sev"] in ("CRITICAL","HIGH","MEDIUM")][:12]

    def chip(txt,color): return f'<span class="chip" style="background:{color}">{html.escape(txt)}</span>'
    def row(f):
        imp = " ".join(chip(i,"#2b2b2b") for i in f["impact"])
        loc = f'{html.escape(f["file"])}{":"+str(f["line"]) if f["line"] else ""}' if f["file"] else "—"
        return f"""<tr class="r {f['sev']}">
          <td>{chip(f['sev'],SEV_COLOR[f['sev']])}</td>
          <td><b>{html.escape(f['title'])}</b><div class="d">{html.escape(f['detail'])}</div>
              <div class="fix"><b>Fix:</b> {html.escape(f['fix'])}</div></td>
          <td>{html.escape(f['cat'])}</td><td>{imp}</td>
          <td class="eff">{f['effort']}</td><td class="loc">{loc}</td></tr>"""

    rows = "\n".join(row(f) for f in findings) or '<tr><td colspan=6>No issues found 🎉</td></tr>'
    qrows = "".join(f'<li><b>{html.escape(f["title"])}</b> — {html.escape(f["fix"])}</li>' for f in quick) \
            or "<li>No urgent quick wins — nice.</li>"

    doc = f"""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Website Audit Report</title><style>
:root{{--bg:#0d0d0f;--card:#16161a;--line:#26262c;--tx:#eaeaea;--mut:#9a9aa2}}
*{{box-sizing:border-box}}body{{margin:0;font:15px/1.55 -apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--tx)}}
.wrap{{max-width:1150px;margin:0 auto;padding:28px}}
h1{{font-size:26px;margin:0 0 4px}}.sub{{color:var(--mut);margin-bottom:22px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:22px}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}}
.big{{font-size:34px;font-weight:800}}.mut{{color:var(--mut);font-size:13px}}
.score{{display:flex;align-items:center;gap:18px}}
.ring{{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:34px;font-weight:800;color:#fff;background:conic-gradient({grade[1]} {sc*3.6}deg,#26262c 0)}}
.ring span{{background:var(--card);width:74px;height:74px;border-radius:50%;display:flex;align-items:center;justify-content:center}}
.chip{{display:inline-block;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;margin:1px}}
table{{width:100%;border-collapse:collapse;background:var(--card);border-radius:14px;overflow:hidden;border:1px solid var(--line)}}
th,td{{text-align:left;padding:11px 12px;border-bottom:1px solid var(--line);vertical-align:top;font-size:13.5px}}
th{{background:#1c1c22;position:sticky;top:0;font-size:12px;letter-spacing:.4px;text-transform:uppercase;color:var(--mut)}}
.d{{color:var(--mut);margin-top:4px}}.fix{{margin-top:6px;color:#cfe8ff;font-size:12.5px}}
.eff{{text-align:center;font-weight:700}}.loc{{font-family:ui-monospace,monospace;font-size:11.5px;color:var(--mut);max-width:200px;word-break:break-all}}
.bar{{margin:18px 0;display:flex;gap:8px;flex-wrap:wrap}}
.btn{{background:#1c1c22;border:1px solid var(--line);color:var(--tx);padding:7px 13px;border-radius:20px;cursor:pointer;font-size:12.5px}}
.btn.active{{background:var(--tx);color:#111;font-weight:700}}
.qw{{background:var(--card);border:1px solid var(--line);border-left:4px solid #1db954;border-radius:12px;padding:14px 18px;margin-bottom:22px}}
.qw li{{margin:6px 0}}.legend{{font-size:12px;color:var(--mut);margin-top:8px}}
a{{color:#7ab8ff}}
</style></head><body><div class="wrap">
<h1>🔍 Website Audit Report</h1>
<div class="sub">{html.escape(os.path.abspath(root))} · {n_code} code files, {n_img} images · {datetime.now():%d %b %Y, %H:%M}</div>

<div class="grid">
 <div class="card score"><div class="ring"><span style="color:{grade[1]}">{grade[0]}</span></div>
   <div><div class="big">{sc}<span class="mut">/100</span></div><div class="mut">Overall health</div></div></div>
 <div class="card"><div class="big" style="color:{SEV_COLOR['CRITICAL']}">{by_sev.get('CRITICAL',0)}</div><div class="mut">Critical</div></div>
 <div class="card"><div class="big" style="color:{SEV_COLOR['HIGH']}">{by_sev.get('HIGH',0)}</div><div class="mut">High</div></div>
 <div class="card"><div class="big" style="color:{SEV_COLOR['MEDIUM']}">{by_sev.get('MEDIUM',0)}</div><div class="mut">Medium</div></div>
 <div class="card"><div class="big">{len(findings)}</div><div class="mut">Total findings</div></div>
</div>

<div class="qw"><b>⚡ Quick wins (high impact · low effort)</b><ol>{qrows}</ol></div>

<div class="bar" id="fbar">
 <button class="btn active" data-f="all">All ({len(findings)})</button>
 <button class="btn" data-f="CRITICAL">Critical</button>
 <button class="btn" data-f="HIGH">High</button>
 <button class="btn" data-f="MEDIUM">Medium</button>
 <button class="btn" data-f="LOW">Low</button>
 <button class="btn" data-f="Security">Security</button>
 <button class="btn" data-f="Marketing">Marketing</button>
 <button class="btn" data-f="SEO">SEO/GEO</button>
 <button class="btn" data-f="Performance">Performance</button>
 <button class="btn" data-f="ROAS">↑ROAS</button>
 <button class="btn" data-f="CVR">↑CVR</button>
 <button class="btn" data-f="CTR">↑CTR</button>
</div>

<table id="tbl"><thead><tr><th>Sev</th><th>Finding & Fix</th><th>Category</th><th>Impact</th><th>Effort</th><th>Location</th></tr></thead>
<tbody>{rows}</tbody></table>
<div class="legend">Effort: S = quick (&lt;1h), M = medium (a few hours), L = larger project. Impact chips show which metric each fix moves. Filter buttons match severity, category, or impact.</div>
</div>
<script>
const btns=document.querySelectorAll('#fbar .btn');
btns.forEach(b=>b.onclick=()=>{{btns.forEach(x=>x.classList.remove('active'));b.classList.add('active');
 const f=b.dataset.f;document.querySelectorAll('#tbl tbody tr').forEach(r=>{{
   r.style.display=(f==='all'||r.className.includes(f)||r.innerHTML.includes('>'+f+'<'))?'':'none';}});}});
</script></body></html>"""
    with open(out,"w",encoding="utf-8") as fp: fp.write(doc)

def json_report(root, n_code, n_img, out):
    data = {"root":os.path.abspath(root),"generated":datetime.now().isoformat(),
            "code_files":n_code,"images":n_img,"score":score(),
            "counts":dict(Counter(f["sev"] for f in findings)),
            "findings":findings,"marketing_signals":site_signals}
    with open(out,"w",encoding="utf-8") as fp: json.dump(data,fp,indent=2)

# ------------------------------------------------------------------ CLI
def main():
    ap = argparse.ArgumentParser(description="Full-stack website auditor (security + SEO + perf + CRO/marketing).")
    ap.add_argument("path", nargs="?", default=".", help="Project folder to audit")
    ap.add_argument("--out", default="audit_report.html", help="HTML output file")
    ap.add_argument("--json", default="audit_report.json", help="JSON output file")
    ap.add_argument("--open", action="store_true", help="Open the report in a browser")
    a = ap.parse_args()
    root = os.path.abspath(a.path)
    if not os.path.isdir(root):
        print(f"❌ Not a folder: {root}"); sys.exit(1)
    print(f"🔍 Auditing {root} ...")
    nc, ni = run_audit(root)
    html_report(root, nc, ni, a.out)
    json_report(root, nc, ni, a.json)
    sev = Counter(f["sev"] for f in findings)
    print(f"✅ Done. Score {score()}/100 · {len(findings)} findings "
          f"(CRIT {sev.get('CRITICAL',0)}, HIGH {sev.get('HIGH',0)}, MED {sev.get('MEDIUM',0)})")
    print(f"   → {a.out}\n   → {a.json}")
    if a.open:
        webbrowser.open("file://"+os.path.abspath(a.out))

if __name__ == "__main__":
    main()
