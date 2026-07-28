# helm_deploy/dev/secrets/

Plaintext Secret templates for the dev environment, pre-filled at project
generation the same way `ansible/host_vars/*/vault.yml` is: the random keys
are already generated, the rest are `REPLACE_ME` placeholders.

**Everything matching `*.yaml` in this directory is gitignored.** It is the
one place in the repo where plaintext secrets are allowed to sit. What gets
committed is the *sealed* output in `../extra/`, which is safe to store in
git because only the cluster's sealed-secrets controller can decrypt it.

```
secrets/                        (plaintext, gitignored)
  gitlab-registry.yaml   ->  ../extra/sealed-secret-gitlab-registry.yaml
  django-env.yaml        ->  ../extra/sealed-secret-django-env.yaml
{%- if cookiecutter.frontend_style == SPA or cookiecutter.frontend_style == SPA_NEXT %}
  node-env.yaml          ->  ../extra/sealed-secret-node-env.yaml
{%- endif %}
  seal.sh                     (committed - the kubeseal wrapper)
```

## Workflow

Prerequisites: `kubeseal` on PATH (`brew install kubeseal`) and a kubeconfig
pointing at the target cluster - `kubeseal` fetches the controller's public
cert over the API. Sealing needs cluster *read* access only; you do not need
permission to create Secrets.

1. **Fill in the placeholders.** Grep for what is left:

   ```sh
   grep -rn REPLACE_ME helm_deploy/dev/secrets/
   ```

   Delete keys you do not use rather than sealing an empty string - an empty
   env var overrides the Django setting default instead of falling back to it.

   For `gitlab-registry.yaml` you can generate the file instead of editing it.
   Create a GitLab **deploy token** (Settings -> Repository -> Deploy tokens)
   scoped to `read_registry`, then:

   ```sh
   kubectl create secret docker-registry gitlab-registry \
     --namespace {{ cookiecutter.repo_name|as_hostname }}-dev \
     --docker-server=registry.gitlab.com \
     --docker-username='<deploy-token-username>' \
     --docker-password='<deploy-token>' \
     --dry-run=client -o yaml > helm_deploy/dev/secrets/gitlab-registry.yaml
   ```
{%- if cookiecutter.frontend_style == SPA or cookiecutter.frontend_style == SPA_NEXT %}

   For the JWT keypair shared between django and node:

   ```sh
   ssh-keygen -t rsa -b 4096 -m PEM -f jwt.key -N '' \
     && openssl rsa -in jwt.key -pubout -outform PEM -out jwt.key.pub
   ```

   Paste the private PEM into `django-env.yaml`'s `DJANGO_JWT_PRIVATE_KEY`,
   and the public PEM into **both** `DJANGO_JWT_PUBLIC_KEY` and
   `node-env.yaml`'s `APP_PUBLIC_JWT_PUBLIC_KEY` (they must be identical -
   node verifies what django signs). Then `rm jwt.key jwt.key.pub`.
{%- endif %}

2. **Seal.**

   ```sh
   ./helm_deploy/dev/secrets/seal.sh
   ```

   This writes `../extra/sealed-secret-<name>.yaml` for each file, with the
   `argocd.argoproj.io/sync-wave: "-1"` annotation already applied. It refuses
   to seal a file that still contains `REPLACE_ME`.

   Override the controller location if it is not `sealed-secrets` in
   `kube-system`:

   ```sh
   SEALED_SECRETS_CONTROLLER_NAMESPACE=sealed-secrets ./helm_deploy/dev/secrets/seal.sh
   ```

3. **Wire them up.** Uncomment the `sealed-secret-*.yaml` entries under
   `resources:` in `../extra/kustomization.yaml`, and set `environmentSecret`
   on the apps in `../values.yaml`:

   ```yaml
   applications:
     django:
       environmentSecret: {{ cookiecutter.repo_name|as_hostname }}-django-env
{%- if cookiecutter.frontend_style == SPA or cookiecutter.frontend_style == SPA_NEXT %}
     node:
       environmentSecret: {{ cookiecutter.repo_name|as_hostname }}-node-env
{%- endif %}
   ```

   `gitlab-registry` needs no `environmentSecret` - it is already listed under
   `imageSecrets` in `values.yaml` as the image pull secret.

4. **Commit the sealed output only.**

   ```sh
   git add helm_deploy/dev/extra/sealed-secret-*.yaml helm_deploy/dev/extra/kustomization.yaml helm_deploy/dev/values.yaml
   ```

   `git status` should never show anything under `helm_deploy/dev/secrets/`
   except `seal.sh` and this README. If it does, the gitignore rule was lost -
   fix that before committing.

## Rotating a secret

Edit the plaintext file here, re-run `seal.sh`, commit the regenerated
sealed manifest. ArgoCD syncs it and the controller updates the derived
Secret in place - but **running pods keep the old env**, so follow up with a
`kubectl -n {{ cookiecutter.repo_name|as_hostname }}-dev rollout restart deploy` for the affected apps.

If you lost the plaintext (fresh checkout, new developer), you cannot recover
it from the sealed manifest - only the cluster can decrypt that. Generate a
new value and rotate as above.

## Copying to staging / prod

`cp -r dev <env>` copies these templates too. Change the `namespace:` in each
file - a SealedSecret is sealed *for a specific namespace and name* by
default, so a sealed manifest from `dev` will not decrypt in `prod`. Re-seal
from the new directory rather than copying `extra/sealed-secret-*.yaml`
across.
