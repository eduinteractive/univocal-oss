#!/bin/bash
set -euo pipefail

BASE_HASH_FILE=".temp/.uvc-base.hash"
CURRENT_HASH=$(find lib/ pnpm-lock.yaml pnpm-workspace.yaml package.json -type f -exec sha256sum {} + | sha256sum)

if [[ -f $BASE_HASH_FILE && $(cat $BASE_HASH_FILE) == $CURRENT_HASH ]]; then
  echo "✅ uvc-base ist aktuell, kein Rebuild nötig."
else
  echo "🔧 Änderungen erkannt – baue uvc-base..."
  if [ -n "$(docker images -q uvc/*)" ]; then
    docker rmi $(docker images -q uvc/*) --force
  fi
  docker build -t uvc-base -f docker/Dockerfile.base . || exit 1
  echo "$CURRENT_HASH" > $BASE_HASH_FILE
fi

if [ ! -f .registry.local ]; then
  echo "Missing .registry.local. Create it from .registry.local.example." >&2
  exit 1
fi

echo "📦 Loading local configuration from .registry.local..."
# shellcheck disable=SC1091
source .registry.local

require_var () {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "Missing env var: ${name} (set it in .registry.local)" >&2
    exit 1
  fi
}

require_var SHIB_DEV_ENTITY_ID
require_var SHIB_DEV_DISCOVERY_URL
require_var SHIB_DEV_METADATA_URL
require_var SHIB_DEV_SUPPORT_CONTACT
require_var SHIB_DEV_APACHE_SERVER_NAME

SHIB_ENTITY_ID="${SHIB_DEV_ENTITY_ID}"
SHIB_DISCOVERY_URL="${SHIB_DEV_DISCOVERY_URL}"
SHIB_METADATA_URL="${SHIB_DEV_METADATA_URL}"
SHIB_SUPPORT_CONTACT="${SHIB_DEV_SUPPORT_CONTACT}"
SHIB_APACHE_SERVER_NAME="${SHIB_DEV_APACHE_SERVER_NAME}"

export SHIB_ENTITY_ID SHIB_DISCOVERY_URL SHIB_METADATA_URL SHIB_SUPPORT_CONTACT SHIB_APACHE_SERVER_NAME

K8S_DEV_DIR="core/uvc-infra/k8s/dev"
restore_dev_manifests() {
  set +e
  if [ -f "${K8S_DEV_DIR}/shibboleth-configmap.yaml.backup-shib" ]; then
    mv "${K8S_DEV_DIR}/shibboleth-configmap.yaml.backup-shib" "${K8S_DEV_DIR}/shibboleth-configmap.yaml"
  fi
  if [ -f "${K8S_DEV_DIR}/shibboleth-apache-configmap.yaml.backup-shib" ]; then
    mv "${K8S_DEV_DIR}/shibboleth-apache-configmap.yaml.backup-shib" "${K8S_DEV_DIR}/shibboleth-apache-configmap.yaml"
  fi
  set -e
}
trap 'dev_exit=$?; restore_dev_manifests; exit "$dev_exit"' EXIT

# Render Shibboleth configmaps from ${SHIB_*} placeholders
cp "${K8S_DEV_DIR}/shibboleth-configmap.yaml" "${K8S_DEV_DIR}/shibboleth-configmap.yaml.backup-shib"
cp "${K8S_DEV_DIR}/shibboleth-apache-configmap.yaml" "${K8S_DEV_DIR}/shibboleth-apache-configmap.yaml.backup-shib"
envsubst < "${K8S_DEV_DIR}/shibboleth-configmap.yaml.backup-shib" > "${K8S_DEV_DIR}/shibboleth-configmap.yaml"
envsubst < "${K8S_DEV_DIR}/shibboleth-apache-configmap.yaml.backup-shib" > "${K8S_DEV_DIR}/shibboleth-apache-configmap.yaml"

echo "🚀 Starte skaffold dev..."
skaffold dev -p dev