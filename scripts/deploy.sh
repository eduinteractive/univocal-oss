#!/bin/bash

# Compliant deployment script for uvc
# Usage: ./scripts/deploy.sh <version_base> [environment] [action]

set -euo pipefail

# Check if version base is provided
if [ -z "$1" ]; then
    echo "Error: Version base is required"
    echo "Usage: ./scripts/deploy.sh <version_base> [environment] [action]"
    echo "Example: ./scripts/deploy.sh 2.0.0 prod"
    exit 1
fi

# Get version base from CLI argument
VERSION_BASE="$1"

# Generate version information
BUILD_DATE=$(date +%Y-%m-%d)
BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
APP_VERSION="${VERSION_BASE}-${GIT_SHA}"
DOC_VERSION="${VERSION_BASE}-${GIT_SHA}"
DOC_OWNER="Education Interactive"
DOC_APPROVED_BY="CEO"

echo "🚀 Starting compliant deployment for prod environment..."

# Generate version information
echo "📋 Generating version information..."

echo "🔧 Version details:"
echo "   APP_VERSION: ${APP_VERSION}"
echo "   DOC_VERSION: ${DOC_VERSION}"
echo "   DOC_OWNER: ${DOC_OWNER}"
echo "   DOC_APPROVED_BY: ${DOC_APPROVED_BY}"
echo "   BUILD_DATE: ${BUILD_DATE}"
echo "   GIT_SHA: ${GIT_SHA}"

# Debug: Show original kustomization
echo "🔍 Original kustomization annotations:"
grep -A 10 "commonAnnotations:" core/uvc-infra/k8s/prod/kustomization.yaml


echo "🏗️  Building and deploying with Skaffold..."

# Load local configuration (required)
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

require_var REGISTRY_URL
require_var REGISTRY_SECRET
require_var SHIB_PROD_ENTITY_ID
require_var SHIB_PROD_DISCOVERY_URL
require_var SHIB_PROD_METADATA_URL
require_var SHIB_PROD_SUPPORT_CONTACT
require_var SHIB_PROD_APACHE_SERVER_NAME

SHIB_ENTITY_ID="${SHIB_PROD_ENTITY_ID}"
SHIB_DISCOVERY_URL="${SHIB_PROD_DISCOVERY_URL}"
SHIB_METADATA_URL="${SHIB_PROD_METADATA_URL}"
SHIB_SUPPORT_CONTACT="${SHIB_PROD_SUPPORT_CONTACT}"
SHIB_APACHE_SERVER_NAME="${SHIB_PROD_APACHE_SERVER_NAME}"

# Export all variables for envsubst
export APP_VERSION DOC_VERSION DOC_OWNER DOC_APPROVED_BY BUILD_DATE BUILD_TIMESTAMP GIT_SHA GIT_BRANCH
export REGISTRY_URL REGISTRY_SECRET
export SHIB_ENTITY_ID SHIB_DISCOVERY_URL SHIB_METADATA_URL SHIB_SUPPORT_CONTACT SHIB_APACHE_SERVER_NAME

# Backup original files
cp core/uvc-infra/k8s/prod/kustomization.yaml core/uvc-infra/k8s/prod/kustomization.yaml.backup
find core/uvc-infra/k8s/prod -name "*.yaml" -type f ! -name "kustomization.yaml" ! -name "*.backup" -exec sh -c 'cp "$1" "$1.backup"' _ {} \;

BACKUPS_CREATED=1
K8S_PROD_DIR="core/uvc-infra/k8s/prod"

# Restore placeholders and *.yaml from *.yaml.backup (runs on success, failure, or interrupt)
restore_prod_manifests() {
    [ "${BACKUPS_CREATED:-0}" = "1" ] || return 0
    set +e
    if [ -f "${K8S_PROD_DIR}/kustomization.yaml.backup" ]; then
        mv "${K8S_PROD_DIR}/kustomization.yaml.backup" "${K8S_PROD_DIR}/kustomization.yaml"
    fi
    find "${K8S_PROD_DIR}" -name "*.yaml.backup" -exec sh -c 'mv "$1" "${1%.backup}"' _ {} \;
    if [ -n "${REGISTRY_URL:-}" ] && [ -f skaffold.prod.yaml ]; then
        sed -i '' "s|${REGISTRY_URL}|REGISTRY_URL_PLACEHOLDER|g" skaffold.prod.yaml
    fi
    set -e
}
# Preserve Skaffold/build exit code; restore working tree whenever backups were taken
trap 'deploy_exit=$?; restore_prod_manifests; [ "$deploy_exit" -ne 0 ] && echo "⚠️  Restored prod k8s YAML backups and skaffold.prod.yaml placeholders (deploy step failed)." >&2; exit "$deploy_exit"' EXIT

# Replace registry placeholders in all YAML files
echo "🔄 Replacing registry placeholders..."
find core/uvc-infra/k8s/prod -name "*.yaml" -type f ! -name "kustomization.yaml" ! -name "*.backup" -exec sed -i '' "s|REGISTRY_URL_PLACEHOLDER|${REGISTRY_URL}|g" {} \;
find core/uvc-infra/k8s/prod -name "*.yaml" -type f ! -name "kustomization.yaml" ! -name "*.backup" -exec sed -i '' "s|REGISTRY_SECRET_PLACEHOLDER|${REGISTRY_SECRET}|g" {} \;

# Replace registry placeholders in skaffold.prod.yaml
sed -i '' "s|REGISTRY_URL_PLACEHOLDER|${REGISTRY_URL}|g" skaffold.prod.yaml

# Create temporary kustomization with substituted variables
TEMP_KUSTOMIZATION="/tmp/kustomization-$(date +%s).yaml"
envsubst < core/uvc-infra/k8s/prod/kustomization.yaml > "$TEMP_KUSTOMIZATION"

# Copy the substituted kustomization back
cp "$TEMP_KUSTOMIZATION" core/uvc-infra/k8s/prod/kustomization.yaml

# Clean up temp file
rm "$TEMP_KUSTOMIZATION"

# Render Shibboleth configmaps from ${SHIB_*} placeholders
envsubst < core/uvc-infra/k8s/prod/shibboleth-configmap.yaml.backup > core/uvc-infra/k8s/prod/shibboleth-configmap.yaml
envsubst < core/uvc-infra/k8s/prod/shibboleth-apache-configmap.yaml.backup > core/uvc-infra/k8s/prod/shibboleth-apache-configmap.yaml

# Debug: Show what was substituted
echo "🔍 Substituted kustomization preview:"
grep -A 5 "commonAnnotations:" core/uvc-infra/k8s/prod/kustomization.yaml

skaffold run -f skaffold.prod.yaml -p prod

echo "✅ Deployment completed successfully!"
echo "📊 Deployment metadata:"
echo "   Environment: prod"
echo "   Version: ${APP_VERSION}"
echo "   Build Date: ${BUILD_DATE}"
echo "   Git Commit: ${GIT_SHA}"
