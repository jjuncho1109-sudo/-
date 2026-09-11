param(
    [int]$Port = 5000
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Prefixes.Add("http://+:$Port/") # 모든 인터페이스 바인딩 시도 (실패 시 localhost만 유지)
try {
    $listener.Start()
} catch {
    # + 바인딩 권한 부족 시 localhost만으로 재시작
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
    $listener.Start()
}

Write-Host "🌟 '빛으로' 안전 서버가 실행되었습니다: http://localhost:$Port/"

$root = $PSScriptRoot

function Handle-Request($context) {
    [System.Threading.ThreadPool]::QueueUserWorkItem({
        param($ctx)
        try {
            $req = $ctx.Request
            $res = $ctx.Response

            # CORS 헤더 추가
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            $res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $res.AddHeader("Access-Control-Allow-Headers", "*")

            if ($req.HttpMethod -eq "OPTIONS") {
                $res.StatusCode = 200
                $res.OutputStream.Close()
                return
            }

            $rawPath = $req.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrEmpty($rawPath) -or $rawPath -eq "index.html") {
                $rawPath = "index.html"
            } elseif ($rawPath -eq "api/safety_data") {
                $rawPath = "safe_spots.json"
            }

            # 파일 시스템 경로 매핑
            $cleanPath = $rawPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = [System.IO.Path]::Combine($root, $cleanPath)

            if (-not [System.IO.File]::Exists($filePath)) {
                # templates 또는 static 하위 확인
                $altPath1 = [System.IO.Path]::Combine($root, "static", $cleanPath)
                $altPath2 = [System.IO.Path]::Combine($root, "templates", $cleanPath)
                if ([System.IO.File]::Exists($altPath1)) {
                    $filePath = $altPath1
                } elseif ([System.IO.File]::Exists($altPath2)) {
                    $filePath = $altPath2
                }
            }

            if ([System.IO.File]::Exists($filePath)) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    ".ico"  { "image/x-icon" }
                    default { "application/octet-stream" }
                }

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $res.ContentType = $contentType
                $res.ContentLength64 = $bytes.Length
                $res.StatusCode = 200
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $res.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
                $res.ContentType = "text/plain; charset=utf-8"
                $res.ContentLength64 = $msg.Length
                $res.OutputStream.Write($msg, 0, $msg.Length)
            }
        } catch {
            Write-Warning "Handler Exception: $_"
        } finally {
            try { $ctx.Response.OutputStream.Close() } catch {}
        }
    }, $context) | Out-Null
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        Handle-Request($context)
    }
} finally {
    $listener.Stop()
}
