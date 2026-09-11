$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8
try {
    $html = $wc.DownloadString("https://following-subscription-harvard-syntax.trycloudflare.com/")
    Write-Host "EXTERNAL_TUNNEL_SUCCESS: HTML length = " $html.Length
} catch {
    Write-Host "EXTERNAL_TUNNEL_ERR: $_"
}
