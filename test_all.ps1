$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8

$urls = @(
    "http://localhost:5000/",
    "http://localhost:5000/static/style.css",
    "http://localhost:5000/static/script.js",
    "http://localhost:5000/api/safety_data",
    "https://following-subscription-harvard-syntax.trycloudflare.com/",
    "https://following-subscription-harvard-syntax.trycloudflare.com/static/style.css",
    "https://following-subscription-harvard-syntax.trycloudflare.com/static/script.js",
    "https://following-subscription-harvard-syntax.trycloudflare.com/api/safety_data"
)

foreach ($u in $urls) {
    try {
        $data = $wc.DownloadString($u)
        Write-Host "OK ($($data.Length) bytes): $u"
    } catch {
        Write-Host "ERR: $u => $_"
    }
}
