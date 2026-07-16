# helm_deploy/dev/

ArgoCD-managed dev environment for `{{ cookiecutter.repo_name }}`.

Picked up by the `clients-helm-dev` ApplicationSet in
[tg-platform-gitops](https://gitlab.com/thorgate/tg-platform-gitops),
which matches any repo in the `thorgate` GitLab group with topic
`argo-managed` that has both:

- `helm_deploy/dev/` (this directory), AND
- `helm_deploy/dev/values.yaml` (committed)

If your app isn't showing up as an `Application` in ArgoCD, double-check
the topic on your project's GitLab settings page first.

## Layout

```
helm_deploy/dev/
  values.yaml              chart config (Phoenix), probes, env, ingress
  images.yaml              image refs (auto-bumped by argocd-image-updater)
  extra/
    namespace.yaml         {{ cookiecutter.repo_name }}-dev namespace + labels
    postgres.yaml          movetokube Postgres + PostgresUser CRs (sync-wave -10/-9)
    imageupdater.yaml      ImageUpdater CR (PreSync hook, dedicated write Secret)
    kustomization.yaml     kustomize config for the extras
```

Add `staging/` and `prod/` by `cp -r dev <env>` and adjusting:
- namespace + ingress hostnames in `values.yaml`
- branch + tag regex in `extra/imageupdater.yaml` (e.g. `prod-` prefix)
- the env label in `extra/namespace.yaml`

## First-time setup (one-off, per project)

1. **Tag the repo** as `argo-managed` in GitLab (Settings -> General -> Topics).
   Without this, the ApplicationSet won't pick it up.

2. **Adjust the TODOs** marked in each file under `helm_deploy/dev/`.
   Most are stable defaults (Thorgate-cluster conventions); the ones
   you must touch are:
   - `values.yaml`: image registry path if not Thorgate, settings module,
     gunicorn command, extensions in `extra/postgres.yaml`
   - `namespace.yaml`: `customer` label for cost attribution

   `extra/imageupdater.yaml` is already set to this repo's default branch
   (`{{ default_git_branch }}`) in both the `allowTags` regex and
   `writeBackConfig.branch` - no edit needed unless you rename the branch,
   in which case update both together.

3. **Push an initial image** via the project's CI. `publish-prod-image.sh`
   tags every commit as `<branch-slug>-<sha>` (e.g. `{{ default_git_branch }}-<sha>`
   on the default branch), which is what `allowTags` matches. Image-updater
   detects the first matching tag and replaces the `PLACEHOLDER` in
   `images.yaml` automatically.

4. **Confirm Application Healthy** in the ArgoCD UI:
   `https://argocd.client-cluster-1.thorgatedigital.tools/applications/argocd/{{ cookiecutter.repo_name|as_hostname }}-helm-dev`

## How the project name flows into resource names

Cookiecutter renders `repo_name` from your project title via
`slugify(separator='_')`, so it can have underscores (e.g.
`circular_orbit`). But several places require DNS-1123 (lowercase
alphanumeric + hyphens only) or hostname compatibility:

| Resource | Format | Filter applied |
|---|---|---|
| Postgres / PostgresUser CR `name` | k8s object name (DNS-1123) | `\| as_hostname` |
| Namespace | k8s namespace (DNS-1123) | `\| as_hostname` |
| Ingress hostname | DNS | `\| as_hostname` |
| ImageUpdater CR `metadata.name` | k8s object name | `\| as_hostname` |
| ImageUpdater `namePattern` | matches the Application name from the appset (already hyphen-form) | `\| as_hostname` |
| Postgres `spec.database` | postgres identifier (underscores OK) | none |
| `spec.role` | postgres identifier (underscores OK) | none |
| Container image registry path | flexible, underscores typically allowed | none |

The `as_hostname` filter is from the template's `tg_filters` extension
and converts `_` to `-`. If your `repo_name` has no underscores the
filter is a no-op.

## Operational notes

- **Postgres credentials** come from the movetokube-generated Secret
  `dbcred-{{ cookiecutter.repo_name|as_hostname }}-dev-user`. The Secret's `DATABASE_HOST`
  field may be empty for OWNER-privileged users; `values.yaml` pins
  `DJANGO_DATABASE_HOST` to `pg17-rw.databases.svc.cluster.local`
  explicitly to work around that.

- **`gitlab-write-credentials` Secret** must exist in the `argocd`
  namespace (created out-of-band - see tg-platform-gitops README
  section 3). The `imageupdater.yaml` references it via
  `method: "git:secret:argocd/gitlab-write-credentials"`. If you see
  401s in `kubectl -n argocd logs deploy/argocd-image-updater-controller`,
  that Secret is missing or stale.

- **Resetting the movetokube CRs** (if `kubectl get postgres,postgresuser`
  shows `succeeded=true` but the actual PG cluster has no database -
  e.g. after a CNPG volume incident): delete both CRs, annotate the
  Application with `argocd.argoproj.io/refresh=hard`, wait for the
  CRs to come back, then rollout-restart consumer pods so they pick
  up the new password from the regenerated Secret. See
  `tg-platform-gitops/scripts/migrate/` for an automated version.

## Experimental warning

This scaffold is **experimental** in dpt-template (gated behind the
`use_kubernetes` cookiecutter var). The chart version pinned in
`values.yaml` is a pre-1.0 dev tag. Expect:

- Chart values may move around between Phoenix versions.
- The `confident_curie` / `eager_cannon` template-test projects do not
  yet have a k8s-deployed counterpart - the `circular_orbit` project
  (when generated; note underscore - it flows through the cookiecutter
  slugify and renders as `circular-orbit` for ingress hostnames + k8s
  namespace via the `as_hostname` filter, see the table above) will
  serve that role.
- For production deployments, prefer the established ansible flow
  until Phoenix stabilises and `circular-orbit` has run a full
  lifecycle (deploy + cutover + a few image-updater cycles + token
  rotation) without surprises.
