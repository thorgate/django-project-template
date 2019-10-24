from jinja2.ext import Extension


def as_identifier(value):
    # Replace dash with underscore
    # This is for adding support to not restrict project generation target to be only valid Python identifier
    # Helps with generating for repository name e.g `test-project` and all internal values will be then `test_project`
    return value.replace('-', '_')


class CleanRepoNameModule(Extension):
    def __init__(self, environment):
        super().__init__(environment)

        environment.filters['as_identifier'] = as_identifier
