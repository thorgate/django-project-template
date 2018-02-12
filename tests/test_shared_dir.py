import os


def test_tmpdir_path(tmpdir):
    if os.environ.get('CI_SERVER') == 'yes':
        assert str(tmpdir).startswith(os.environ['TPL_PLAYGROUND'])
