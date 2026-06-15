#!/bin/sh
# Send ntfy notification - requires NTFY_HOST and NTFY_ACCESS_TOKEN env vars
# Usage: ./scripts/ntfy.sh "Title" "Message body"

TOPIC="cmd"
HOST="${NTFY_HOST:-}"
TOKEN="${NTFY_ACCESS_TOKEN:-}"

if [ -z "$HOST" ] || [ -z "$TOKEN" ]; then
  echo "NTFY_HOST or NTFY_ACCESS_TOKEN not set, skipping notification" >&2
  exit 0
fi

TITLE="${1:-CommandCode}"
MESSAGE="${2:-Task completed}"

curl -s -o /dev/null -X POST "https://${HOST}/${TOPIC}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Title: ${TITLE}" \
  -d "${MESSAGE}"

echo "Notification sent to ntfy" >&2
