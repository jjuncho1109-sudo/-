$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (Test-Path $csc) {
    & $csc /out:GenSpots.exe GenSpots.cs
    .\GenSpots.exe
} else {
    Write-Host "csc not found"
}
