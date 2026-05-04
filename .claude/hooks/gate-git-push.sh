#!/usr/bin/env bash
# Đóng băng hành động đẩy code trực tiếp lên nhánh main.
set -euo pipefail

payload="$(cat)"
# Cần cài đặt công cụ jq trên máy để parse JSON, nếu chưa có, lệnh này sẽ bỏ qua
cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null || echo '')"

case "$cmd" in
  *"git push"*"origin main"*|*"git push"*" main"*)
    # Nếu AI định push lên main, ép nó dừng lại chờ phê duyệt
    echo '{"permissionDecision": "defer", "reason": "🚨 STOP: Hành động Push trực tiếp lên nhánh main cần Outcast đích thân phê duyệt!"}'
    ;;
  *)
    # Các lệnh bash khác (như ls, cd, mvn clean) thì cho phép qua
    echo '{"permissionDecision": "allow"}'
    ;;
esac