#!/bin/zsh

ROOT="$(cd "$(dirname "$0")" && pwd)"

"$ROOT/scripts/publish-live.sh"
status=$?

echo
if [ "$status" -eq 0 ]; then
  echo "Publishing finished successfully. The phone update is ready."
else
  echo "Publishing stopped with an error. Nothing after the failed step was attempted."
fi
echo "Press Return to close this window."
read -r
exit "$status"
