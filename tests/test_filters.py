from extensions.tg_filters import as_git_path, get_url_path


def test_as_git_path(tmpdir):
    assert as_git_path("gitlab.com/group/project") == "git@gitlab.com:group/project.git"
    assert (
        as_git_path("http://gitlab.com/group/project")
        == "git@gitlab.com:group/project.git"
    )
    assert (
        as_git_path("https://gitlab.com/group/project")
        == "git@gitlab.com:group/project.git"
    )

    assert (
        as_git_path("https://gitlab.com/group/project.git")
        == "git@gitlab.com:group/project.git"
    )
    assert (
        as_git_path("git@gitlab.com:group/project.git")
        == "git@gitlab.com:group/project.git"
    )

    assert (
        as_git_path("https://gitlab.com/group/subgroup/project.git")
        == "git@gitlab.com:group/subgroup/project.git"
    )
    assert (
        as_git_path("git@gitlab.com:group/subgroup/project.git")
        == "git@gitlab.com:group/subgroup/project.git"
    )


def test_get_url_path():
    assert (
        get_url_path("https://gitlab.com/thorgate-public/django-project-template")
        == "thorgate-public/django-project-template"
    )
    assert (
        get_url_path("http://gitlab.com/thorgate-public/django-project-template")
        == "thorgate-public/django-project-template"
    )
    assert (
        get_url_path("gitlab.com/thorgate-public/django-project-template")
        == "thorgate-public/django-project-template"
    )

    assert (
        get_url_path("git@gitlab.com:thorgate-public/django-project-template.git")
        == "thorgate-public/django-project-template"
    )
    assert (
        get_url_path("gitlab.com/thorgate-public/django-project-template.git")
        == "thorgate-public/django-project-template"
    )
    assert (
        get_url_path("http://gitlab.com/thorgate-public/django-project-template.git")
        == "thorgate-public/django-project-template"
    )
    assert (
        get_url_path("https://gitlab.com/thorgate-public/django-project-template.git")
        == "thorgate-public/django-project-template"
    )

    assert (
        get_url_path("https://github.com/thorgate/django-project-template")
        == "thorgate/django-project-template"
    )
    assert (
        get_url_path("git@github.com:thorgate/django-project-template.git")
        == "thorgate/django-project-template"
    )
    assert (
        get_url_path("http://github.com/thorgate/django-project-template.git")
        == "thorgate/django-project-template"
    )
    assert (
        get_url_path("https://github.com/thorgate/django-project-template.git")
        == "thorgate/django-project-template"
    )
    assert (
        get_url_path("github.com/thorgate/django-project-template.git")
        == "thorgate/django-project-template"
    )

    # this test is commented out since `git-url-parse` returns unexpected result when the url has a subgroup.
    #
    # We expect it to return `group/subgroup/project` but it returns `/gitlab.com/group/subgroup/project` since
    #  the regex in `git-url-parse` does not expect owner to allow multi-level items.
    #
    #  https://github.com/coala/git-url-parse/pull/40 is the fix for the issue
    #
    # assert (
    #     get_url_path("https://gitlab.com/group/subgroup/project.git")
    #     == "group/subgroup/project"
    # )

    assert (
        get_url_path("git@gitlab.com:group/subgroup/project.git")
        == "group/subgroup/project"
    )
