# PreToolUse: gate push to main (Windows-friendly)
$payload = [Console]::In.ReadToEnd()
$cmd = ''
if ($payload) {
    try {
        $json = $payload | ConvertFrom-Json
        if ($json.tool_input.command) { $cmd = $json.tool_input.command }
        elseif ($json.command) { $cmd = $json.command }
    } catch { }
}

if ($cmd -match 'git push' -and $cmd -match 'main') {
    '{"permission":"ask","user_message":"Push lên nhánh main cần bạn xác nhận.","agent_message":"Đề xuất push nhánh feature hoặc phê duyệt push main."}'
} else {
    '{"permission":"allow"}'
}
