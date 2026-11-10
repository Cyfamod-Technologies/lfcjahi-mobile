#!/bin/sh
set -eu

# Only authenticate for Metro startup; allow one-off CLI commands unchanged.
if [ "${1:-}" = "npx" ] && [ "${2:-}" = "expo" ] && [ "${3:-}" = "start" ]; then
  if [ "${EXPO_LOGIN_ON_START:-1}" = "1" ]; then
    echo 'Expo browser login: open the link printed below to authenticate.'
    echo 'Remote server: forward the localhost callback port over SSH before opening the link.'
    echo 'Metro and its QR code will start after login succeeds.'
    npx expo login --browser
  fi
fi

exec "$@"
