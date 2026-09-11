Add-Type -AssemblyName System.Web
$lms = @('진주동명고등학교', '동명중학교', '명신고등학교', '진주고등학교', '진주여자고등학교', '대아고등학교', '경남예술고등학교', '초전공원')
foreach ($name in $lms) {
    try {
        $q = [System.Web.HttpUtility]::UrlEncode("진주시 " + $name)
        $url = "https://nominatim.openstreetmap.org/search?q=$q&format=json&limit=1"
        $r = Invoke-RestMethod -Uri $url -UserAgent "AntigravityDev/1.0"
        if ($r.Count -gt 0) {
            [Console]::WriteLine("$name : lat=$($r[0].lat), lon=$($r[0].lon), name=$($r[0].display_name)")
        } else {
            [Console]::WriteLine("$name : NOT FOUND")
        }
    } catch {
        [Console]::WriteLine("$name : ERROR $_")
    }
    Start-Sleep -Milliseconds 500
}
