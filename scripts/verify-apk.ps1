param(
  [string]$ApplicationId,
  [string]$Version,
  [int]$VersionCode,
  [string]$Apk = (Join-Path (Split-Path -Parent $PSScriptRoot) 'android/app/build/outputs/apk/release/app-release.apk')
)
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -ErrorAction Stop
$taskRoot = Split-Path -Parent $PSScriptRoot
if (!(Test-Path -LiteralPath $Apk) -or (Get-Item -LiteralPath $Apk).Length -eq 0) { throw 'Release APK is missing or empty' }
$taskTools = Get-ChildItem -LiteralPath (Join-Path $env:ANDROID_HOME 'build-tools') -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'apksigner.bat') } | Sort-Object Name -Descending | Select-Object -First 1
if (!$taskTools) { throw 'Android APK inspection tools unavailable' }
$taskSignature = (& (Join-Path $taskTools.FullName 'apksigner.bat') verify --verbose --print-certs $Apk | Out-String)
if ($LASTEXITCODE -ne 0) { throw 'APK signature validation failed' }
$taskCertificate = (Get-Content -LiteralPath (Join-Path $taskRoot 'docs/INTERNAL_CERTIFICATE_SHA256.txt') -Raw).Trim()
if ($taskSignature -notmatch [regex]::Escape($taskCertificate)) { throw 'APK does not use the recorded internal certificate' }
$taskBadging = (& (Join-Path $taskTools.FullName 'aapt.exe') dump badging $Apk | Out-String)
if ($LASTEXITCODE -ne 0) { throw 'APK metadata inspection failed' }
if ($taskBadging -notmatch "package: name='$([regex]::Escape($ApplicationId))' versionCode='$VersionCode' versionName='$([regex]::Escape($Version))'") { throw 'APK package or version differs from requested release' }
if ($taskBadging -match 'application-debuggable') { throw 'APK is debuggable' }
$taskManifest = (& (Join-Path $taskTools.FullName 'aapt.exe') dump xmltree $Apk AndroidManifest.xml | Out-String)
if ($LASTEXITCODE -ne 0) { throw 'APK manifest inspection failed' }
if ($taskManifest -match 'expo\.modules\.devlauncher|expo\.modules\.devmenu') { throw 'APK contains a development launcher/menu component' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskZip = [System.IO.Compression.ZipFile]::OpenRead($Apk)
try {
  $taskBundle = $taskZip.GetEntry('assets/index.android.bundle')
  if (!$taskBundle -or $taskBundle.Length -lt 1000) { throw 'APK has no bundled application JavaScript' }
  $taskSecrets = @($taskZip.Entries | Where-Object { $_.FullName -match '(?i)(\.(p12|jks|keystore|dpapi)$|(^|/)\.env($|\.)|credentials\.json$)' })
  if ($taskSecrets.Count) { throw 'APK contains a credential file' }
} finally { $taskZip.Dispose() }
$taskEvidence = Join-Path $taskRoot '.work/apk-validation'
New-Item -ItemType Directory -Path $taskEvidence -Force | Out-Null
$taskSignature | Set-Content -LiteralPath (Join-Path $taskEvidence 'signature.txt')
$taskBadging | Set-Content -LiteralPath (Join-Path $taskEvidence 'badging.txt')
$taskManifest | Set-Content -LiteralPath (Join-Path $taskEvidence 'manifest.txt')
Write-Output "Verified signed standalone release: $ApplicationId $Version build $VersionCode"
Get-FileHash -LiteralPath $Apk -Algorithm SHA256
