import sys

from poetry.utils.env import EnvManager


if __name__ == "__main__":
    # / since pyproject.toml is copied to the root folder
    env_name = EnvManager.generate_env_name(
        "{{ cookiecutter.repo_name | as_hostname }}", "/"
    )

    print(f"{env_name}-py{sys.version_info.major}.{sys.version_info.minor}")
