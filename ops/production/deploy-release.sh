#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_ROOT="${MADDEVOPS_ROOT:-/home/developpeur/app-infra/maddevops}"
readonly RELEASES_DIR="$APP_ROOT/releases"
readonly CURRENT_LINK="$APP_ROOT/current"
readonly COMPOSE_FILE="$APP_ROOT/docker-compose.yml"
readonly ENV_FILE="$APP_ROOT/.env"

release_sha="${1:?usage: deploy-release.sh <40-char-sha> <archive-path>}"
archive_path="${2:?usage: deploy-release.sh <40-char-sha> <archive-path>}"
checksum_path="${archive_path}.sha256"

fail() {
  printf 'deployment error: %s\n' "$*" >&2
  exit 1
}

case "$release_sha" in
  (*[!0-9a-f]*|'') fail 'release SHA must be lowercase hexadecimal' ;;
esac
test "${#release_sha}" -eq 40 || fail 'release SHA must contain 40 characters'
test -f "$archive_path" || fail "archive is missing: $archive_path"
test -f "$checksum_path" || fail "checksum is missing: $checksum_path"
test -f "$COMPOSE_FILE" || fail "compose file is missing: $COMPOSE_FILE"
test -f "$ENV_FILE" || fail "runtime environment is missing: $ENV_FILE"

compose() {
  docker compose --project-name maddevops --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

ensure_current_link() {
  if [ -L "$CURRENT_LINK" ]; then
    return
  fi

  if [ -e "$CURRENT_LINK" ]; then
    fail "current must be a symlink: $CURRENT_LINK"
  fi

  test -d "$APP_ROOT/app" || fail "legacy app directory is missing: $APP_ROOT/app"
  ln -s app "$CURRENT_LINK"
}

switch_current() {
  local target="$1"
  local candidate="$APP_ROOT/.current-${release_sha}-$$"

  case "$target" in
    app|releases/maddevops-*) ;;
    *) fail "refusing an unexpected release target: $target" ;;
  esac

  ln -s "$target" "$candidate"
  mv -Tf "$candidate" "$CURRENT_LINK"
}

ensure_current_link
previous_target="$(readlink "$CURRENT_LINK")"
case "$previous_target" in
  app|releases/maddevops-*) ;;
  *) fail "current points to an unexpected target: $previous_target" ;;
esac

mkdir -p "$RELEASES_DIR"
archive_dir="$(dirname "$archive_path")"
(
  cd "$archive_dir"
  sha256sum --check "$(basename "$checksum_path")"
)

if tar -tzf "$archive_path" | LC_ALL=C grep -Eq '(^/|(^|/)\.\.(/|$))'; then
  fail 'archive contains an unsafe path'
fi

release_dir="$RELEASES_DIR/maddevops-$release_sha"
release_target="releases/maddevops-$release_sha"
if [ -d "$release_dir" ]; then
  test "$(cat "$release_dir/.release-sha")" = "$release_sha" || fail 'existing release does not match its SHA'
else
  stage_dir="$(mktemp -d "$RELEASES_DIR/.staging-$release_sha.XXXXXX")"
  tar -xzf "$archive_path" --no-same-owner --no-same-permissions -C "$stage_dir"
  test -f "$stage_dir/index.html" || fail 'release does not contain index.html'
  test -f "$stage_dir/api/contact.php" || fail 'release does not contain api/contact.php'
  printf '%s\n' "$release_sha" > "$stage_dir/.release-sha"
  mv "$stage_dir" "$release_dir"
fi

compose config -q

switched=0
rollback_on_error() {
  local status="$1"
  trap - ERR
  if [ "$switched" -eq 1 ]; then
    printf 'deployment failed; restoring %s\n' "$previous_target" >&2
    switch_current "$previous_target"
    compose up -d --force-recreate app php || true
  fi
  exit "$status"
}
trap 'rollback_on_error $?' ERR

switch_current "$release_target"
switched=1
compose up -d --force-recreate app php
compose exec -T php php -l /var/www/html/api/contact.php
curl --fail --silent --show-error --max-time 20 http://127.0.0.1:3000/ >/dev/null
switched=0
trap - ERR

printf 'deployment succeeded: %s (previous: %s)\n' "$release_sha" "$previous_target"
