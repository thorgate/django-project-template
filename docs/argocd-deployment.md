# ArgoCD deployment overview

When a project is generated with `use_kubernetes=yes`, it gets a
`helm_deploy/dev/` scaffold meant to be deployed by [ArgoCD](https://argo-cd.readthedocs.io/).
This page is a high-level overview so you can wire it into your own ArgoCD
if you are not on the Thorgate platform. It is deliberately generic; the
values in the scaffold (hostnames, storage classes, secret names, the
database host) are Thorgate-platform examples you should swap for your own.

## The shape: one multi-source Application

The scaffold is meant to run as a single multi-source ArgoCD Application
that combines:

1. Kustomize overlay (`helm_deploy/dev/extra/`): the Namespace, a ConfigMap
   of non-secret env, the database CRs (`Postgres` / `PostgresUser`), and the
   `ImageUpdater` CR. SealedSecrets go here too, once you add them.
2. Helm chart `phoenix`, from a Helm repository: renders the Deployments,
   Services, and Ingress, configured by `values.yaml`.
3. Values ref, the project repo itself: supplies `values.yaml` (config) and
   `images.yaml` (image tags, kept separate so an image updater can bump it
   without touching config).

You can point a hand-written `Application` at these three sources, or use
an `ApplicationSet` to discover many repos at once.

## Cluster prerequisites

The scaffold assumes these are installed or available in the cluster:

- The `phoenix` Helm chart, in a reachable Helm repo. Pin an exact version;
  a floating dev tag can regress, for example init containers rendering with
  no image tag.
- argocd-image-updater (the CRD/`ImageUpdater`-based variant), which watches
  the registry for new commit-tagged images and writes the tag back into
  `images.yaml`.
- A Postgres operator. The scaffold uses
  [movetokube postgres-operator](https://github.com/movetokube/postgres-operator)
  `Postgres`/`PostgresUser` CRs against a shared cluster. Add an ArgoCD
  health check for these CRs (gating on `status.succeeded == true`) so
  sync-waves hold the app until the database and its credentials Secret exist.
- sealed-secrets, or your own secret mechanism, for registry pull creds and
  app secrets.
- Ingress (the scaffold uses Traefik) and cert-manager for TLS.

## How a change reaches the cluster

```
push commit -> CI builds + pushes an immutable <branch>-<sha> image tag
            -> argocd-image-updater sees it, writes images.yaml, commits
            -> ArgoCD syncs the Application
            -> Deployment rolls to the new tag
```

## Sync ordering

Resources are ordered with ArgoCD sync-waves so the database exists before
the app starts:

- The `extra/` overlay (database CRs, config, secrets) applies at low
  waves, before the chart.
- The chart's workloads apply at a later wave. With the Postgres health
  check above, that later wave waits for the DB credentials Secret, so the
  migration init container has a database to connect to.

Two things that are easy to get wrong:

- SealedSecrets in the overlay must be plain, sync-waved resources
  (`argocd.argoproj.io/sync-wave: "-1"`), never ArgoCD or Helm hooks. A hook
  resource is untracked, and the default hook-delete-policy
  (`BeforeHookCreation`) deletes it before every sync - so an interrupted sync
  leaves the SealedSecret and its decrypted Secret gone, and pods fail to pull
  images. Sync-waves apply the Secret before the chart's workloads (same as
  the database CRs) while keeping it tracked and self-healed.
- The database CRs use sync-waves, not helm hooks, for the same reason - and
  additionally because a helm hook would recreate the CR on every sync, which
  rotates the database password and leaves running pods with stale
  credentials.

## Secrets

The scaffold ships plaintext Secret templates in `helm_deploy/dev/secrets/`,
pre-filled at project generation the same way `ansible/host_vars/*/vault.yml`
is: random keys (`DJANGO_SECRET_KEY`, `NEXTAUTH_SECRET`) already generated,
everything else marked `REPLACE_ME`. That whole directory is gitignored - what
gets committed is the sealed output under `helm_deploy/dev/extra/`.

| Plaintext template | Sealed as | Holds |
| --- | --- | --- |
| `secrets/gitlab-registry.yaml` | `extra/sealed-secret-gitlab-registry.yaml` | registry pull creds (`imageSecrets` in `values.yaml`) |
| `secrets/django-env.yaml` | `extra/sealed-secret-django-env.yaml` | `DJANGO_SECRET_KEY`, Sentry DSN, SMTP password, JWT private key, object-storage keys |
| `secrets/node-env.yaml` | `extra/sealed-secret-node-env.yaml` | `NEXTAUTH_SECRET`, JWT public key, frontend Sentry DSN (SPA modes only) |

The workflow is: fill in the placeholders, run `secrets/seal.sh` (a `kubeseal`
wrapper that also stamps the `argocd.argoproj.io/sync-wave: "-1"` annotation on
each manifest), uncomment the entries in `extra/kustomization.yaml`, and set
`environmentSecret` on the apps in `values.yaml`. `helm_deploy/dev/secrets/README.md`
in a generated project has the full walkthrough.

If you use something other than sealed-secrets (External Secrets Operator,
SOPS, Vault), keep the plaintext templates as the list of keys each app needs
and replace `seal.sh` plus the `extra/` output with your own equivalent.

### The registry pull secret

This is the one that blocks everything else: without it, every pod fails with
`ImagePullBackOff` / "Unable to retrieve image pull secrets". For GitLab,
create a **deploy token** (project Settings -> Repository -> Deploy tokens)
scoped to `read_registry`, then generate the plaintext Secret:

```sh
kubectl create secret docker-registry gitlab-registry \
  --namespace <app-namespace> \
  --docker-server=registry.gitlab.com \
  --docker-username='<deploy-token-username>' \
  --docker-password='<deploy-token>' \
  --dry-run=client -o yaml > helm_deploy/dev/secrets/gitlab-registry.yaml
```

and seal it. Note this is a *pull* secret living in the app's namespace, and
is distinct from the two cluster-wide secrets argocd-image-updater uses: one
to poll the registry for new tags, one to push the `images.yaml` bump back to
git (`gitlab-registry-credentials` and `gitlab-write-credentials` in the
`argocd` namespace, in the scaffold's naming).

### Rotation

Edit the plaintext file, re-seal, commit. The controller updates the derived
Secret in place, but running pods keep the old env - follow up with a
`kubectl rollout restart deploy` for the affected apps. Sealed manifests are
not recoverable back to plaintext: if the plaintext is lost, generate a new
value and rotate.

Sealed values are also namespace- and name-scoped by default, so copying
`dev/` to `staging/` means changing the `namespace:` in each plaintext
template and re-sealing, not copying the sealed manifests across.

## Setting it up on your own ArgoCD

1. Install the operators above (or adapt the scaffold to your equivalents).
2. Create an `Application`/`ApplicationSet` with the three sources, a
   destination namespace, and `CreateNamespace=true`.
3. Replace the Thorgate-specific values: ingress hostnames, `storageClass`,
   the cross-namespace `DJANGO_DATABASE_HOST`, image registry paths, and
   the image pull / write-back secret names.
4. Fill in and seal the secrets (see "Secrets" above). They land in
   `helm_deploy/dev/extra/` as plain, sync-waved resources
   (`argocd.argoproj.io/sync-wave: "-1"`) - never hooks (see above).

## Thorgate projects

You do not need to set any of this up by hand. The platform's
`ApplicationSet` discovers the repo automatically once it is tagged
`argo-managed`; the concrete wiring lives in Thorgate's internal gitops
repository. See that repo for the ApplicationSet definition, the pinned
chart version, and the shared operator installs.
