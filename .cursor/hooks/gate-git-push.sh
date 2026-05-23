#!/usr/bin/env bash
# Chặn push trực tiếp lên main; luôn in JSON hợp lệ cho Cursor preToolUse (field: permission).
payload="$(cat 2>/dev/null || true)"
cmd=""

if command -v jq >/dev/null 2>&1 && [ -n "$payload" ]; then
  cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // .command // empty' 2>/dev/null || true)"
fi

case "$cmd" in
  *"git push"*"origin main"*|*"git push"*" main"*|*"git push -u origin main"*)
    printf '%s\n' '{"permission":"ask","user_message":"Push lên nhánh main cần bạn xác nhận.","agent_message":"Đề xuất push nhánh feature thay vì main, hoặc phê duyệt push main."}'
    ;;
  *)
    printf '%s\n' '{"permission":"allow"}'
    ;;
esac
exit 0
