#!/usr/bin/env bash
#
# Seal every plaintext Secret in this directory into a SealedSecret manifest
# in ../extra/, ready to commit.
#
#   ./seal.sh                 # seal all *.yaml in this directory
#   ./seal.sh django-env.yaml # seal just one
#
# Requires `kubeseal` and a kubeconfig pointing at the target cluster (it
# fetches the sealed-secrets controller's public cert). Override the
# controller location if yours is not `sealed-secrets` in `kube-system`:
#
#   SEALED_SECRETS_CONTROLLER_NAME=sealed-secrets \
#   SEALED_SECRETS_CONTROLLER_NAMESPACE=sealed-secrets ./seal.sh
#
# After sealing, uncomment the matching entries under `resources:` in
# ../extra/kustomization.yaml and reference the Secrets from ../values.yaml
# via `environmentSecret`.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$HERE/../extra"

CONTROLLER_NAME="${SEALED_SECRETS_CONTROLLER_NAME:-sealed-secrets}"
CONTROLLER_NS="${SEALED_SECRETS_CONTROLLER_NAMESPACE:-kube-system}"
# Any wave lower than the chart's wave-30 works; -1 keeps SealedSecrets at
# the front of the overlay, like extra/configmap.yaml and the postgres CRs.
SYNC_WAVE="${SEALED_SECRET_SYNC_WAVE:--1}"

if ! command -v kubeseal >/dev/null 2>&1; then
    echo "ERROR: kubeseal not found on PATH." >&2
    echo "  brew install kubeseal   # or see https://github.com/bitnami-labs/sealed-secrets/releases" >&2
    exit 1
fi

seal_one() {
    local src="$1"
    local dst="$OUT_DIR/sealed-secret-$(basename "$src")"

    if grep -q 'REPLACE_ME' "$src"; then
        echo "ERROR: $(basename "$src") still has REPLACE_ME placeholders." >&2
        echo "       Fill them in, or delete the keys you do not need, then re-run." >&2
        return 1
    fi

    # kubeseal does not annotate the SealedSecret it emits, and the sync-wave
    # must sit on the SealedSecret itself (not on spec.template.metadata,
    # which only reaches the derived Secret). Inject it into the manifest's
    # top-level metadata block. See ../extra/kustomization.yaml for why this
    # must be a sync-waved resource and never a PreSync/helm hook.
    kubeseal --format yaml \
        --controller-name "$CONTROLLER_NAME" \
        --controller-namespace "$CONTROLLER_NS" \
        <"$src" \
        | awk -v wave="$SYNC_WAVE" '
            !done && /^metadata:$/ {
                print
                print "  annotations:"
                print "    argocd.argoproj.io/sync-wave: \"" wave "\""
                done = 1
                next
            }
            { print }
          ' >"$dst"

    echo "sealed $(basename "$src") -> extra/$(basename "$dst")"
}

if [ "$#" -gt 0 ]; then
    for name in "$@"; do
        seal_one "$HERE/$(basename "$name")"
    done
else
    shopt -s nullglob
    found=0
    for src in "$HERE"/*.yaml; do
        seal_one "$src"
        found=1
    done
    if [ "$found" -eq 0 ]; then
        echo "No *.yaml files in $HERE - nothing to seal." >&2
        exit 1
    fi
fi

echo
echo "Done. Next:"
echo "  1. uncomment the sealed-secret-*.yaml entries in helm_deploy/dev/extra/kustomization.yaml"
echo "  2. set environmentSecret on the apps in helm_deploy/dev/values.yaml"
echo "  3. commit ONLY helm_deploy/dev/extra/sealed-secret-*.yaml (the plaintext here is gitignored)"
