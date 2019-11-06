#### A note on workspaces

This [terraform](https://www.terraform.io/intro/index.html)
setup uses one [workspace](https://www.terraform.io/docs/state/workspaces.html)
for staging and one for production.
If staging and production start having different requirements,
then stop using workspaces to separate them and keep them entirely separate.


#### Authorization

Terraform switches to a custom IAM role for dealing with
the remote state, the IAM user credentials provided
when running terraform must be allowed to switch to that role
and be allowed to create all the resources asked for.

#### Overview of files here

* `terraform` wrapper for terraform command
* `setup.sh` Does the initial seutp and deploys for production and staging
* `main.tf` Primary endpoint
* `variables.tf` Contains [variables](https://www.terraform.io/docs/configuration/variables.html)
* `modules` [modules](https://www.terraform.io/docs/modules/index.html)
* `modules/s3_media` Creates a bucket for media files with an associated IAM user


#### Making changes

Make sure to use the correct environment (`production` or `staging`)
in this example we'll use `staging`.

When adding new resources, make sure that they have
both `terraform.workspace` and `var.project` somewhere in their name (or other unique things)
so it can be applied in all environments without conflict.

Run [apply](https://www.terraform.io/docs/commands/apply.html): `TF_WORKSPACE=staging ./terraform apply` (see also [plan](https://www.terraform.io/docs/commands/plan.html))

Don't forget to run [fmt](https://www.terraform.io/docs/commands/fmt.html): `TF_WORKSPACE=staging ./terraform fmt -recursive .`


#### Backend

This uses s3 backend with locking provided by dynamodb.
The `key` in the backend configuration must be unique to this project.


#### Destroy everything

To delete an s3 bucket, it must first be empty, you'll need to manually
delete everything in it.

Then run:

```
workspace=workspace-to-destry

TF_WORKSPACE="$workspace" ./terraform destroy

# If you want to get rid of the workspace as well:
TF_WORKSPACE=default ./terraform workspace delete "$workspace"
```


#### Importing existing resources

If you have existing resources that you wish to be managed by terraform,
then see [import](https://www.terraform.io/docs/import/usage.html)
