# helm_deploy/dev/

ArgoCD-managed dev environment for `{{ cookiecutter.repo_name }}`.

Picked up by the `clients-helm-dev` ApplicationSet in Thorgate's internal
gitops repo, which matches any repo in the `thorgate` GitLab group with
topic `argo-managed` that has both:

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

## Resource naming

k8s object names and hostnames here must be DNS-1123 (lowercase
alphanumeric + hyphens, no underscores): the Namespace, the Postgres /
PostgresUser / ImageUpdater CR names, and the ingress hostnames. The
Postgres `spec.database` / `spec.role` and the container image registry
path may keep underscores. Keep this in mind when copying `dev/` to
`staging/` / `prod/` and editing names by hand.

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

This helm / ArgoCD deploy setup is **experimental**. The Phoenix chart is
pinned to a pre-1.0 dev tag in `values.yaml`, so expect:

- Chart values may move around between Phoenix versions.
- For production, prefer the established ansible flow until the chart
  stabilises and this scaffold has run a full lifecycle (deploy + cutover
  + a few image-updater cycles + token rotation) without surprises.
