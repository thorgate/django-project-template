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

- SealedSecrets in the overlay must be ArgoCD `PreSync` hooks
  (`argocd.argoproj.io/hook: PreSync`, no delete-policy). In a multi-source
  Application, an unannotated or `helm.sh/hook` SealedSecret does not apply
  reliably, so its decrypted Secret keeps disappearing and pods fail to pull
  images.
- The database CRs use sync-waves, not helm hooks. A helm hook would make
  ArgoCD recreate the CR on every sync, which rotates the database password
  and leaves running pods with stale credentials.

## Setting it up on your own ArgoCD

1. Install the operators above (or adapt the scaffold to your equivalents).
2. Create an `Application`/`ApplicationSet` with the three sources, a
   destination namespace, and `CreateNamespace=true`.
3. Replace the Thorgate-specific values: ingress hostnames, `storageClass`,
   the cross-namespace `DJANGO_DATABASE_HOST`, image registry paths, and
   the image pull / write-back secret names.
4. Add your SealedSecrets (registry pull creds, Django env) as `PreSync`
   hooks in `helm_deploy/dev/extra/`.

## Thorgate projects

You do not need to set any of this up by hand. The platform's
`ApplicationSet` discovers the repo automatically once it is tagged
`argo-managed`; the concrete wiring lives in Thorgate's internal gitops
repository. See that repo for the ApplicationSet definition, the pinned
chart version, and the shared operator installs.
