#!/bin/bash
# =============================================================================
# deluge-notify.sh
# Drop this script on your Deluge host and point the Execute plugin at it.
#
# Deluge Execute plugin passes these args:
#   $1 = torrent ID (hash)
#   $2 = torrent name
#   $3 = save path
#
# Set EVENT before calling, or let each trigger script set it.
# =============================================================================

MEDIANOTIFY_URL="${MEDIANOTIFY_URL:-http://localhost:5055}"
AUTH_TOKEN="${MEDIANOTIFY_AUTH_TOKEN:-}"
EVENT="${1:-torrent_complete}"
HASH="${2:-}"
NAME="${3:-Unknown}"
SAVE_PATH="${4:-}"

# Build JSON payload
PAYLOAD=$(cat <<EOF
{
  "event":     "${EVENT}",
  "hash":      "${HASH}",
  "name":      "${NAME}",
  "save_path": "${SAVE_PATH}"
}
EOF
)

# Build curl args
CURL_ARGS=(-s -o /dev/null -w "%{http_code}" \
  -X POST "${MEDIANOTIFY_URL}/webhook/deluge" \
  -H "Content-Type: application/json")

if [ -n "$AUTH_TOKEN" ]; then
  CURL_ARGS+=(-H "x-auth-token: ${AUTH_TOKEN}")
fi

CURL_ARGS+=(-d "${PAYLOAD}")

STATUS=$(curl "${CURL_ARGS[@]}")

if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
  echo "[deluge-notify] OK ($STATUS) — ${EVENT}: ${NAME}"
else
  echo "[deluge-notify] FAILED ($STATUS) — ${EVENT}: ${NAME}" >&2
fi
