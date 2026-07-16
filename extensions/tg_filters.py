import subprocess

import stringcase
import giturlparse

from jinja2.ext import Extension


def get_default_git_branch():
    """Best-effort default branch for the generated project.

    On a template UPGRADE (re-rendering into an existing checkout) this
    returns the project's current branch, so helm_deploy references stay
    correct for repos on `main` as well as `master`.

    On a FRESH generation there is no repo yet, so it falls back to
    `master` - which is exactly what hooks/post_gen_project.py checks the
    new repo out as. Keep that hook and this fallback in sync.
    """
    try:
        branch = (
            subprocess.check_output(
                ["git", "symbolic-ref", "--short", "HEAD"],
                stderr=subprocess.DEVNULL,
            )
            .decode()
            .strip()
        )
        return branch or "master"
    except Exception:
        return "master"


def as_hostname(value):
    # Replace underscores with dash - to allow using the value as a hostname
    return value.replace("_", "-")


def snake_to_pascal_case(value):
    return stringcase.pascalcase(value)


def as_git_path(value):
    if not value or not value.strip():
        return value

    res = value.strip()

    if res.startswith("git@"):
        parts = giturlparse.parse(res)
        path = "/".join(x for x in [parts.owner, parts.name] if x)
        return f"git@{parts.resource}:{path}.git"

    res = res.replace("http://", "")
    res = res.replace("https://", "")

    # Strip .git suffix from a git http/https url
    if res.endswith(".git"):
        res = res[:-4]

    domain, rest = res.split("/", maxsplit=1)

    return f"git@{domain}:{rest}.git"


def get_url_path(value):
    """Takes a gitlab repository url and returns its path component

    Example:
    >>> get_url_path("https://gitlab.com/thorgate-public/django-project-template")
    >>> "thorgate-public/django-project-template"
    """
    if not value or not value.strip():
        return value

    res = value.strip()

    if res.startswith("git@") or res.endswith(".git"):
        try:
            if not res.startswith("git@") and not res.startswith("http"):
                # add https:// prefix to make giturlparse happy with the uris
                res = f"https://{res}"

            parts = giturlparse.parse(res)

            return "/".join(
                x
                for x in [
                    parts.owner,
                    parts.name,
                ]
                if x
            )

        except giturlparse.ParserError:
            pass

    res = res.replace("http://", "")
    res = res.replace("https://", "")

    domain, rest = res.split("/", maxsplit=1)

    return f"{rest}"


class TGFiltersModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters["as_hostname"] = as_hostname
        environment.filters["snake_to_pascal_case"] = snake_to_pascal_case
        environment.filters["as_git_path"] = as_git_path
        environment.filters["get_url_path"] = get_url_path

        environment.globals["default_git_branch"] = get_default_git_branch()

        environment.globals.update(
            SPA="spa",
            SPA_NEXT="spa-next",
            WEBAPP="webapp",
            ALPINE="alpine",
            DEBIAN="debian",
            YES="yes",
            NO="no",
            S3="S3",
            GCS="GCS",
        )
