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
