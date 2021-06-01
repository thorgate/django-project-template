# Docker image scripts

This folder contains scripts used to build and push production docker images for the
project. Out of the box we have support for gitlab image registries but one can also
use a different registry with some modifications to the configuration.

The scripts are usually executed during a ci run, but it is also possible to build
the images locally.

## Build images locally

0. Make sure to authenticate with the registry. For gitlab, you can copy the login
    command from the `Container Registry` page.
1. Run `git fetch origin`
2. Check out the correct commit/branch/tag and make sure it is up to date with origin
3. Make sure there are no changes in the working directory
4. Define some environment variables:

```bash
# Set this to the value of your docker registry url. For a project called `confident_curie`
#  under thorgate group in gitlab the value would be:
#
# registry.gitlab.com/thorgate/confident_curie
#
# Please note that the image type (e.g. `django`) does not need to be appended to this
#  as that is done automatically by the publish script.
export CI_REGISTRY_IMAGE=""
# Set this ONLY when building an image from a git tag
export CI_COMMIT_TAG=""
# Set this when building an image from a git branch or commit
#
#  In case of a commit set this to the branch of the commit (e.g. master)
export CI_COMMIT_REF_SLUG=""
```

5. Now you can execute the `publish-prod-image.sh` script:

```bash
./publish-prod-image.sh django Dockerfile-django.production
{%- if cookiecutter.frontend_style == 'spa' %}
./publish-prod-image.sh node Dockerfile-node.production
{%- endif %}
```

This will build and push the appropriate docker image. Once it is available you
can then deploy it to a server via Ansible.
