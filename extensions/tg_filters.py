import stringcase
import giturlparse

from jinja2.ext import Extension


def as_hostname(value):
    # Replace underscores with dash - to allow using the value as a hostname
    return value.replace("_", "-")


def snake_to_pascal_case(value):
    return stringcase.pascalcase(value)


def as_git_path(value):
    if not value or not value.strip():
        return value

    res = value.strip()

    # value is already a git ssh url. Return it as is
    if value.startswith("git@"):
        return value

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

        environment.globals.update(
            SPA="spa",
            WEBAPP="webapp",
            ALPINE="alpine",
            DEBIAN="debian",
            YES="yes",
            NO="no",
            S3="S3",
            GCS="GCS",
        )
