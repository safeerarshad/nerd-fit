$ErrorActionPreference = 'Stop'
# Node can inherit PowerShell 7 module paths; use this host's security module.
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Utility/Microsoft.PowerShell.Utility.psd1') -ErrorAction Stop
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskSigningDir = Join-Path $env:USERPROFILE '.nerdfit/signing'
$taskKey = Join-Path $taskSigningDir 'nerdfit-internal.p12'
$taskPasswordFile = Join-Path $taskSigningDir 'password.dpapi'
$taskIdentityFile = Join-Path $taskRoot 'docs/INTERNAL_CERTIFICATE_SHA256.txt'
. (Join-Path $PSScriptRoot 'signing-policy.ps1')
$taskCreate = Assert-SigningPair -KeyExists (Test-Path -LiteralPath $taskKey) -PasswordExists (Test-Path -LiteralPath $taskPasswordFile) -PublishedIdentityExists (Test-Path -LiteralPath $taskIdentityFile)
New-Item -ItemType Directory -Path $taskSigningDir -Force | Out-Null
& icacls.exe $taskSigningDir /inheritance:r /grant:r "$($env:USERNAME):(OI)(CI)F" | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not protect the signing directory' }
if ($taskCreate) {
  $taskBytes = New-Object byte[] 32
  $taskRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $taskRng.GetBytes($taskBytes)
  $taskRng.Dispose()
  $taskSecure = ConvertTo-SecureString ([Convert]::ToBase64String($taskBytes)) -AsPlainText -Force
  $taskSecure | ConvertFrom-SecureString | Set-Content -LiteralPath $taskPasswordFile
}
$taskSecure = (Get-Content -LiteralPath $taskPasswordFile -Raw).Trim() | ConvertTo-SecureString
$taskCredential = New-Object System.Management.Automation.PSCredential ('nerdfit', $taskSecure)
$env:NERDFIT_STORE_PASSWORD = $taskCredential.GetNetworkCredential().Password
$env:NERDFIT_INTERNAL_KEYSTORE = $taskKey
try {
  if ($taskCreate) {
    & keytool.exe -genkeypair -storetype PKCS12 -keystore $taskKey -alias nerd-fit-internal -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=Nerd Fit Internal, O=Nerd Fit, C=IN' -storepass:env NERDFIT_STORE_PASSWORD -keypass:env NERDFIT_STORE_PASSWORD
    if ($LASTEXITCODE -ne 0) { throw 'Internal signing-key creation failed' }
  }
  & keytool.exe -list -keystore $taskKey -alias nerd-fit-internal -storepass:env NERDFIT_STORE_PASSWORD | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Existing internal signing identity could not be opened' }
  $taskPublicCertificate = Join-Path $taskSigningDir 'certificate.der'
  & keytool.exe -exportcert -keystore $taskKey -alias nerd-fit-internal -storepass:env NERDFIT_STORE_PASSWORD -file $taskPublicCertificate
  if ($LASTEXITCODE -ne 0) { throw 'Could not export public signing certificate' }
  $taskFingerprint = (Get-FileHash -LiteralPath $taskPublicCertificate -Algorithm SHA256).Hash.ToLowerInvariant()
  if (Test-Path -LiteralPath $taskIdentityFile) {
    if ((Get-Content -LiteralPath $taskIdentityFile -Raw).Trim() -ne $taskFingerprint) { throw 'Signing certificate differs from the recorded internal identity. Restore the original credentials.' }
  } else {
    Set-Content -LiteralPath $taskIdentityFile -Value $taskFingerprint -Encoding ascii
  }
  Push-Location (Join-Path $taskRoot 'android')
  try {
    & .\gradlew.bat app:assembleRelease --console=plain '-PreactNativeArchitectures=arm64-v8a,x86_64' --no-daemon
    if ($LASTEXITCODE -ne 0) { throw 'Standalone Android release compilation failed' }
  } finally { Pop-Location }
} finally {
  Remove-Item Env:NERDFIT_STORE_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:NERDFIT_INTERNAL_KEYSTORE -ErrorAction SilentlyContinue
  $taskCredential = $null
  $taskSecure = $null
}
