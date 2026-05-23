#!/usr/bin/env bash
if [[ -x ".cursor/hooks/gate-git-push.sh" ]]; then
  exec bash ".cursor/hooks/gate-git-push.sh"
fi
printf '%s\n' '{"permission":"allow"}'
exit 0
