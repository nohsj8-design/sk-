$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$ignorePath = Join-Path $projectRoot '.gitignore'
$ignoreText = if (Test-Path -LiteralPath $ignorePath) { [IO.File]::ReadAllText($ignorePath) } else { '' }
foreach ($rule in @('.env', '.env.*', '!.env.example')) {
  if ($ignoreText -split '\r?\n' -notcontains $rule) { $ignoreText += "`n$rule`n" }
}
[IO.File]::WriteAllText($ignorePath, $ignoreText, [Text.UTF8Encoding]::new($false))
Write-Host 'Busan tourism API key setup (input is hidden)'
Write-Host 'Paste your data.go.kr ServiceKey, then press Enter. Do not send it in chat.'
$secureKey = Read-Host 'ServiceKey' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
  $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr).Trim()
  if ($plainKey.Length -lt 10 -or $plainKey -match '[\r\n\s"''#]') { throw 'Invalid key format. Please copy the key only.' }
  $envPath = Join-Path $projectRoot '.env'
  $envLines = if (Test-Path -LiteralPath $envPath) { [IO.File]::ReadAllLines($envPath) | Where-Object { $_ -notmatch '^\s*BUSAN_TOURISM_SERVICE_KEY\s*=' } } else { @() }
  $envLines = @($envLines) + "BUSAN_TOURISM_SERVICE_KEY=$plainKey"
  [IO.File]::WriteAllLines($envPath, $envLines, [Text.UTF8Encoding]::new($false))
  Write-Host 'Saved locally to .env. The key is excluded from Git.'
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  $plainKey = $null; $secureKey.Dispose(); $envLines = $null
}
Push-Location $projectRoot
try { & node (Join-Path $PSScriptRoot 'fetch-busan-tourism.mjs') } finally { Pop-Location }
Write-Host 'You can close this window. If collection failed, check approval for this API in data.go.kr.'
Read-Host 'Press Enter to close'
