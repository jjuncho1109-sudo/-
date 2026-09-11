$downloads = "C:\Users\YG_home\Downloads"
$files = Get-ChildItem -Path $downloads -Filter "*.csv" -Recurse
foreach ($f in $files) {
    Write-Host "FOUND_CSV: $($f.FullName) ($($f.Length) bytes)"
}
