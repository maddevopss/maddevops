#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_ROOT="${MADDEVOPS_ROOT:-/home/developpeur/app-infra/maddevops}"
readonly CURRENT_LINK="$APP_ROOT/current"
readonly COMPOSE_FILE="$APP_ROOT/docker-compose.yml"
readonly ENV_FILE="$APP_ROOT/.env"

release_sha="${1:?usage: rollback-release.sh <40-char-sha>}"

fail() {
  printf 'rollback error: %s\n' "$*" >&2
  exit 1
}

case "$release_sha" in
  (*[!0-9a-f]*|'') fail 'release SHA must be lowercase hexadecimal' ;;
esac
test "${#release_sha}" -eq 40 || fail 'release SHA must contain 40 characters'
test -L "$CURRENT_LINK" || fail "current must be a symlink: $CURRENT_LINK"
test -f "$COMPOSE_FILE" || fail "compose file is missing: $COMPOSE_FILE"
test -f "$ENV_FILE" || fail "runtime environment is missing: $ENV_FILE"

release_target="releases/maddevops-$release_sha"
release_dir="$APP_ROOT/$release_target"
test -d "$release_dir" || fail "release is missing: $release_sha"
test "$(cat "$release_dir/.release-sha")" = "$release_sha" || fail 'release metadata does not match its SHA'

compose() {
  docker compose --project-name maddevops --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

previous_target="$(readlink "$CURRENT_LINK")"
case "$previous_target" in
  app|releases/maddevops-*) ;;
  *) fail "current points to an unexpected target: $previous_target" ;;
esac

compose config -q
candidate="$APP_ROOT/.current-rollback-${release_sha}-$$"
ln -s "$release_target" "$candidate"
mv -Tf "$candidate" "$CURRENT_LINK"

rollback_on_error() {
  local status="$1"
  trap - ERR
  ln -s "$previous_target" "$candidate"
  mv -Tf "$candidate" "$CURRENT_LINK"
  compose up -d --force-recreate app php || true
  exit "$status"
}
trap 'rollback_on_error $?' ERR

compose up -d --force-recreate app php
compose exec -T php php -l /var/www/html/api/contact.php
curl --fail --silent --show-error --max-time 20 http://127.0.0.1:3000/ >/dev/null
trap - ERR

printf 'rollback succeeded: %s (previous: %s)\n' "$release_sha" "$previous_target"
