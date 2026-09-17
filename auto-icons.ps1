# ══════════════════════════════════════════════════════════════
# Auto icon replacement — safe, dry-run first
# Replaces known emoji in .js and .html files with icon() calls
# Backs up originals to _icon_backup/
# ══════════════════════════════════════════════════════════════

param(
  [switch]$Apply  # pass -Apply to actually modify files
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
if(-not $Root){ $Root = (Get-Location).Path }
$BackupDir = Join-Path $Root "_icon_backup"

# ─── File targets ───
$targetFiles = @(
  "index.html",
  "js/views/home.js",
  "js/views/prayer.js",
  "js/views/hijri.js",
  "js/views/asma.js",
  "js/views/books.js",
  "js/views/reader.js",
  "js/views/session.js",
  "js/views/detail.js",
  "js/views/cats.js",
  "js/views/catMgr.js",
  "js/views/catmgr.js",
  "js/views/confirm.js",
  "js/views/favs.js",
  "js/views/adkar.js",
  "js/views/menu.js"
)

# ─── Replacements ───
# Each entry: [pattern (exact string), replacement, description]
# Order matters — longest/most specific patterns first
$rules = @(
  # ── Header & nav (index.html) ──
  @{ p = '>☰</button>';        r = '></button>';              d = "menu (injected by JS)" }
  @{ p = '>★</button>';        r = '></button>';              d = "star (injected by JS)" }
  @{ p = '>＋</button>';       r = '></button>';              d = "plus (injected by JS)" }
  @{ p = '>🌙</button>';       r = '></button>';              d = "theme toggle (injected)" }

  # ── Back / session buttons ──
  @{ p = '>← Back</button>';   r = ' data-icon="arrow-left"><span class="btn-icon"></span><span>Back</span></button>'; d = "back button" }
  @{ p = '>▶ Session</button>'; r = ' data-icon="play"><span class="btn-icon"></span><span>Session</span></button>';   d = "session button" }
  @{ p = '>▶ Retry GPS</button>'; r = ' data-icon="rotate-ccw"><span class="btn-icon"></span><span>Retry GPS</span></button>'; d = "retry gps" }

  # ── Menu items (already handled) ──

  # ── Home dashboard ──
  @{ p = '<span class="home-prayer-icon">🕌</span>'; r = '<span class="home-prayer-icon">${icon(''mosque'', 16)}</span>'; d = "home prayer icon" }

  # ── Prayer view ──
  @{ p = 'onclick="openLocationPicker()">📍 Choose location</button>';  r = 'onclick="openLocationPicker()" data-icon="map-pin"><span class="btn-icon"></span><span>Choose location</span></button>'; d = "choose location" }
  @{ p = 'onclick="refreshLocation()">↻ Refresh</button>';               r = 'onclick="refreshLocation()" data-icon="rotate-ccw"><span class="btn-icon"></span><span>Refresh</span></button>'; d = "refresh button" }
  @{ p = 'enableLiveCompass(${qibla})">' + "`n" + '          🧭 Enable live compass'; r = 'enableLiveCompass(${qibla})" data-icon="compass">' + "`n" + '          <span class="btn-icon"></span><span>Enable live compass</span>'; d = "enable compass" }

  # ── Emoji in status messages → strip ──
  @{ p = "toast('📍 Updating location…')";    r = "toast('Updating location…')"; d = "strip 📍 from toast" }
  @{ p = "toast('✅ Location updated')";      r = "toast('Location updated ✓')"; d = "toast simplified" }
  @{ p = "toast('⚠️ ' + err.message)";        r = "toast(err.message)"; d = "strip ⚠️ from toast" }

  @{ p = "status.textContent = '⏳ Activating compass…'"; r = "status.textContent = 'Activating compass…'"; d = "strip ⏳" }
  @{ p = "status.textContent = '⚠️ ' + res.reason";       r = "status.textContent = res.reason"; d = "strip ⚠️" }
  @{ p = "status.textContent = '✓ Facing Qibla'";         r = "status.textContent = '✓ Facing Qibla'"; d = "keep (checkmark is fine)" }
)

# ─── Process ───
if(-not (Test-Path $BackupDir)){ New-Item -ItemType Directory -Path $BackupDir | Out-Null }

$totalChanges = 0

foreach($rel in $targetFiles){
  $file = Join-Path $Root $rel
  if(-not (Test-Path $file)){ continue }

  $content = Get-Content $file -Raw -Encoding UTF8
  $original = $content
  $fileChanges = @()

  foreach($rule in $rules){
    if($content.Contains($rule.p)){
      $content = $content.Replace($rule.p, $rule.r)
      $fileChanges += $rule.d
    }
  }

  if($fileChanges.Count -gt 0){
    Write-Host ""
    Write-Host "📄 $rel"
    foreach($c in $fileChanges){ Write-Host "    • $c" }
    $totalChanges += $fileChanges.Count

    if($Apply){
      # Backup original
      $backupPath = Join-Path $BackupDir $rel
      $backupDir = Split-Path $backupPath -Parent
      if(-not (Test-Path $backupDir)){ New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
      Copy-Item -LiteralPath $file -Destination $backupPath -Force

      # Write modified
      Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
      Write-Host "    ✅ WRITTEN (backup: $backupPath)"
    } else {
      Write-Host "    ℹ️  DRY-RUN (pass -Apply to write)"
    }
  }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════"
if($Apply){
  Write-Host "✅ Applied $totalChanges changes across files"
  Write-Host "   Backup: $BackupDir"
} else {
  Write-Host "ℹ️  DRY-RUN: $totalChanges changes would be made"
  Write-Host "   Run again with -Apply to apply them"
  Write-Host "   Example: powershell -File auto-icons.ps1 -Apply"
}
Write-Host "═══════════════════════════════════════════"