import os

from .constants import YES

def test_tmpdir_path(tmpdir):
    if os.environ.get("CI_SERVER") == YES:
        assert str(tmpdir).startswith(os.environ["TPL_PLAYGROUND"])
