# Automated deployments

This project supports automatic deploys :fire: to the test server from master branch and from tags to live server (via CI). The CI
job runs ansible with credentials retrieved from CI variables. For this to work make sure the auto deployment users have
been set up. See [steps here](#set-up-autodeploy-users).

## Automated deployments to test

Merge stuff to master or execute manual deployment job for a branch and the code will be deployed to the test server
by the CI.

## Automated deployments to live

Create a release and it will be deployed to the live server automatically by the CI.

Note: For live there is no manual CI jobs since the live access vault credentials should be marked as protected.

## Set up autodeploy users

Run:

```
ansible-playbook autodeploy.yml --vault-id autodeploy_vault.test.yml@prompt --limit test
ansible-playbook autodeploy.yml --vault-id autodeploy_vault.live.yml@prompt --limit live
```

Then create the secrets in gitlab ui:

```
Key: DPT_AUTODEPLOY_TEST_VAULT_PASSWORD
Type: File
Protect: No
Mask: Yes
```

```
Key: DPT_AUTODEPLOY_LIVE_VAULT_PASSWORD
Type: File
Protect: Yes
Mask: Yes
```

Also create/update the environment variable `SSH_KNOWN_HOSTS` based on instructions [here](https://docs.gitlab.com/ee/ci/ssh_keys/#verifying-the-ssh-host-keys).

## Creating a new environment

First we need to generate an SSH key pair (without passphrase):

```shell script
ssh-keygen -t ed25519 -C {{ cookiecutter.repo_name }}-autodeploy-${ENVIRONMENT}@thorgate.eu -f ./autodeploy-tmp-key
```

Now you should create a new vault file for the environment from [vault-template.yml](./vault-template.yml)
and save it as `<project_root>/ansible/autodeploy_vault.${ENVIRONMENT}.yml`.

Then you can replace `autodeploy_public_key` and `autodeploy_private_key` with the previously generated
ssh keys. Once you do that you should delete the private and public key file as you won't need the original
files anymore.

Once that is completed you can generate a secure password for the autodeploy user and
add it to `autodeploy_user_password`. You also need to update the `autodeploy_pw_hash` to be a hash
of the same password. The hash can be created with python:

```python
from crypt import *
assert METHOD_SHA512 in methods, "SHA512 not available"
crypt("yOURpASSWORDhERE", mksalt(METHOD_SHA512))
```

Finally set the `deploy_vault_pw` to the password of the deployment vault for the environment.

Once everything is done you **MUST encrypt** the autodeploy vault with ansible:

```shell script
poetry run ansible-vault encrypt autodeploy_vault.${ENVIRONMENT}.yml
```

Finally you need to set up a CI job which deployes the code. See `deploy_to_test`, `manual_deploy_to_test`
and `deploy_to_live` jobs in [.gitlab-ci.yml](../../../.gitlab-ci.yml) for an example.

> Please note: When the target environment is a production server then the deploy should only
>  be done from tags or protected branches. This is since the production vault password must be
>  added as a protected and masked secret.
