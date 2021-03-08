"""
Adds a filter `|python_image` that converts a python
version to a docker image.
"""
from jinja2.ext import Extension


DOCKER_BASE_IMAGE_PATTERN = {
    'alpine': 'python:{version}-alpine',
    'debian': 'python:{version}-slim-buster',
}


IMAGE_LOOKUP = {
    # Specific image tags that do not fall into the patterns above, e.g.:
    # '3.6': 'python:3.6-my-awesome-version',
}


def python_image(value, base_image):
    try:
        return IMAGE_LOOKUP[value]
    except KeyError:
        return DOCKER_BASE_IMAGE_PATTERN[base_image].format(version=value)


class TGDockerImageModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.globals['python_image'] = python_image
