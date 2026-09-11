$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
try {
    $html = $wc.DownloadString("http://localhost:5000/")
    Write-Host "SUCCESS: HTML length = " $html.Length
    $json = $wc.DownloadString("http://localhost:5000/api/safety_data")
    Write-Host "SUCCESS: JSON length = " $json.Length
} catch {
    Write-Error $_
}
