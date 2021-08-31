# Ansible Deployments

Contents:

- [Ansible Deployments](#ansible-deployments)
  - [TL;DR](#tldr)
  - [Benefits](#benefits)
  - [Installing ansible](#installing-ansible)
  - [Deployment](#deployment)
    - [Server setup](#server-setup)
    - [Incremental deploy](#incremental-deploy)
      - [Deploying a different version](#deploying-a-different-version)
    - [The first deployment](#the-first-deployment)
    - [Configuring the environment](#configuring-the-environment)
  - [Download server state](#download-server-state)

## TL;DR

The command to deploy the project (change the `limit` arg to `live` if you want to deploy to live servers):

```bash
ansible-playbook --limit test deploy.yml
```

see more details in [Incremental deploy](#incremental-deploy).

## Benefits

[Ansible](https://docs.ansible.com/ansible/latest/index.html), as a configuration & automation framework, provides
fully automated deployments with no user interference on the server host. So all tasks only need to be described
in the configuration, and run on a local machine, thus there is guarantee that no human error would creep in, and that
all hosts managed by the same `ansible` configuration are configured in a consistent fashion.

## Installing ansible

The `ansible` installation is managed by the [Poetry](https://python-poetry.org/docs/) tool, which is a Python package manager.

To install `Poetry` on Linux/OS X, run the following command:

```bash
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python
```

A complete installation guide for `Poetry` is available here: https://python-poetry.org/docs/#installation .

After `Poetry` is installed, run (in the `.ansible` directory):

```bash
poetry install
```

- this will install `ansible` and other dependencies.

With `Poetry` and `ansible` installed, all `ansible` commands can be executed like:

```bash
poetry run ansible-playbook --version
```

or within a subshell started by

```bash
poetry shell
Spawning shell within /home/user/.cache/pypoetry/virtualenvs/{{ cookiecutter.repo_name }}-ansible-Yf1XQtRW-py3.6 ...
({{ cookiecutter.repo_name }}-ansible-Yf1XQtRW-py3.6) user@host:.ansible $
```
in which case you don't need to prefix the commands with `poetry run`. This mode of operation is assumed below
throughout the document.

## Deployment

### Server setup

Your server needs to have [Docker Engine](https://docs.docker.com/engine/installation/)
as well as [Docker Compose](https://docs.docker.com/compose/) installed.

We also assume that you have Nginx and Postgres (version 10 by default) running in Docker containers and reachable via
'private' network. We also make a few assumptions regards directories that will be used as volumes for static assets,
etc. You can find these paths in [docker-compose.production.yml](../docker-compose.production.yml).

{%- if cookiecutter.build_in_ci == YES %}

#### Enable registry access for server

This project is deployed with docker images. The images themselves are built in Gitlab CI. To
be able to deploy the code to the cloud the target server must be able to pull images from registry.gitlab.com.

1. Navigate to repository settings of the project in gitlab
    - {{ cookiecutter.gitlab_repo_url }}/-/settings/repository/
2. Expand `Deploy tokens`
3. Add a deploy token if it does not exist already for the server. Set the name to server name and use
    the project name for username. Under permissions make sure to only enable `read_registry`.
4. Add the deploy token value to the host specific vault file under `registry_token` variable.
5. Now you can run the ansible stack to set up the docker authentication

Note: When you are working directly in the server run the following command to be able to pull images
       from the docker registry:

```bash
source /srv/{{ cookiecutter.repo_name }}/registry.sh
```

The script sets the value of DOCKER_CONFIG to a project specific directory to allow using multiple
credentials for the same docker registry host. This is a workaround for the following
[issue in docker](https://github.com/moby/moby/issues/37569).

{%- endif %}

### Incremental deploy

> NB: If the code has **not been deployed** to the server already follow the instructions in [The first deployment](#the-first-deployment).

Before deploying code ensure that whatever you want deployed is committed and pushed to the server. After that
you can deploy the project to the server by running `deploy.yml` stack with Ansible. This will:

1. Clone & checkout the project into test server (with branch/commit specified in `deployment_version` variable)
2. Add some configuration files (nginx, env, etc)
{%- if cookiecutter.build_in_ci == YES %}
3. Pull docker images for the project from the registry and restart containers if needed
{%- else -%}
3. Build docker images for the project
{%- endif %}
4. Run migrations and collectstatic


Run the stack with (against test server):

```bash
ansible-playbook --limit test deploy.yml
```

#### Deploying a different version

To deploy a specific version of code to the server you can use the `force_deploy` variable. To set it use
 ansibles `-e` CLI parameter.

```bash
ansible-playbook --limit test -e "force_deploy=stable" deploy.yml
```

### The first deployment

* Figure out which server you're going to deploy to.
  We usually have one main test server and one main production server for new project.
* Check [inventory](./inventory) file. It has two groups - `test` and `live`.
  Ensure that the server you'll use is added to the correct group.
* Add (or update) the `vars.yml` and `vault.yml` files for the server in the [host_vars](./host_vars) directory.
  * When creating the files use [vars-template.yml](./host_vars/vars-template.yml) and
     [vault-template.yml](./host_vars/vault-template.yml) as an example.
* If you created the vault file make sure to encrypt it: `ansible-vault encrypt host_vars/<hostname>/vault.yml`
  * NB: Vault for production and test should have different password.
* Check django settings (`settings/staging.py` and/or `settings/production.py`)
* Add the server's SSH key (`/root/.ssh/id_rsa.pub`) to the project repo settings as deployment key.
* Ensure you've committed and pushed all relevant changes.

{% if cookiecutter.django_media_engine == 'S3' -%}
{% if cookiecutter.thorgate == YES %}
* Ensure you have sufficient permissions in AWS to create a bucket and assume the terraform role (see manual steps below if not using terraform)
* Look over the terraform definitions
  * ./deploy/terraform/variables.tf Make sure that the region is the closest one to the user of the project.
  * ./deploy/terraform/modules/s3_media
    - Public access is denied by default, if you want it to be possible to access without signed urls, change these settings.
* Set your aws credentials
    * ` export AWS_ACCESS_KEY_ID=...`
    * ` export AWS_SECRET_ACCESS_KEY=...`
* run `make setup-terraform workspace=WORKSPACE`  where WORKSPACE is 'staging', 'production'
* Keep the terminal window open as some of these values should be copied into the ansible variables (secrets belong in the vault).

<!-- Collapsed block -->
<details>
<summary>Manual steps when not using terraform</summary>

* These steps only apply when not using terraform
{% endif %}

* [Create the bucket for media files](http://docs.aws.amazon.com/AmazonS3/latest/UG/CreatingaBucket.html):
  * Bucket name: {{ cookiecutter.repo_name }}-{ENV} where `ENV` is either `staging` or `production`.
  * Region: Closest to the users of the project.
    * Don't forget to change `AWS_S3_REGION_NAME` to the correct one
  * Public access settings:
    * `Block new public ACLs and uploading public objects (Recommended)` = False
    * `Remove public access granted through public ACLs (Recommended)` = False
  * Properties:
    * Default encryption - AES-256
    * It's nice to add tags
  * Create a new user:
    * Go to [AWS IAM](https://console.aws.amazon.com/iam/home?#users).
    * Click "Create new users" and follow the prompts.
    * Leave "Generate an access key for each User" selected.
    * It's nice to add tags
  * Get the credentials:
    * Go to the new user's Security Credentials tab.
    * Click "Manage access keys".
    * Download the credentials for the access key that was created.
    * and Save them somewhere because no one will ever be able to download them again.
      * Add them to the vault file for the target server
    * Get the new user's ARN (Amazon Resource Name) by going to the user's Summary tab.
       It'll look like this: "arn:aws:iam::123456789012:user/someusername".
  * Go to the bucket properties in the [S3 management console](https://console.aws.amazon.com/s3/home).
  * Add a bucket policy that looks like this, but change "BUCKET-NAME" to the bucket name,
     and "USER-ARN" to your new user's ARN. This grants full access to the bucket and
     its contents to the specified user:

    ```json
    {
        "Statement": [
            {
                "Action": "s3:*",
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::BUCKET-NAME/*",
                    "arn:aws:s3:::BUCKET-NAME"
                ],
                "Principal": {
                    "AWS": [
                        "USER-ARN"
                    ]
                }
            }
        ]
    }
    ```
  * When receiving `signature we calculated does not match` error, one of the following courses of action should fix it:
    * A) waiting; around 1-2 hours max
        * files should still have been uploaded
            * can be confirmed by removing url params in browser (`?X-Amz-Algorithm=....`)
    * B) make sure that `AWS_S3_ADDRESSING_STYLE = "path"` is in django settings. See details in this issue: [django-storages issue](https://github.com/jschneier/django-storages/issues/649),
  * More information about working with S3 can be found [here](https://github.com/Fueled/django-init/wiki/Working-with-S3).

{% if cookiecutter.thorgate == YES %}
</details>
{% endif %}

{% endif %}{% if cookiecutter.django_media_engine == 'GCS' -%}
1. Create a service account ([Google Getting Started Guide](https://cloud.google.com/docs/authentication/getting-started)).
2. Create the key and download your-project-XXXXX.json file.
3. Make sure your service account has access to the bucket and appropriate permissions. ([Using IAM Permissions](https://cloud.google.com/storage/docs/access-control/using-iam-permissions)).
4. Put the contents of the key file into ansible variable `django_gs_credentials` as a json string
{% endif %}

Now that the prerequisites are done you can deploy the code with the following command.

> Replace `ENV` with either `test` or `live` (or the actual hostname of the target server).

```bash
ansible-playbook --limit ENV deploy.yml
```

If it worked, you're all done, congrats!

Otherwise, if something else broke, you can in most cases fix it and then just run the
Ansible stack again.

### Configuring the environment

All the environment variables necessary on the server are located in the 
[environment](./roles/deploy/templates/environment) file, which is installed to `.env` 
in the project root. Variables in this file can be
(and some should be) populated from Ansible variables, including vault variables. 

All docker containers and `docker-compose` itself use environment variables from the `.env` file. 

There is a special ansible target (tag) to update the `.env` file on the server: `env`, e.g.
```shell
ansible-playbook --limit HOST -t env deploy.yml
```

## Download server state

> **Warning:** Using this playbook deletes the local database so back up `.data/postgresql` directory before if you
>               need to preserve your current database.

We have a playbook to download the media and database state from a remote server hosting the project. If the media
files in the remote server are using S3 then you must first install [aws-cli](https://pypi.org/project/awscli/) locally.
The easiest way to do it is via pip: `sudo pip install awscli`.

Every time before you can use the mirror role you also need to run [mirror-prepare.sh](./mirror-prepare.sh) script:

```bash
./mirror-prepare.sh
```

This ensures the permissions of local paths are correct to allow the mirror role to work. Once this is done you
can run the restore role with:

```bash
ansible-playbook -v --limit test mirror.yml
```

To restore only database or media files ansible tags can be used:

```bash
ansible-playbook -v --limit test --tags db mirror.yml  # restores only the database
ansible-playbook -v --limit test --tags media mirror.yml  # restores only the media files
```
