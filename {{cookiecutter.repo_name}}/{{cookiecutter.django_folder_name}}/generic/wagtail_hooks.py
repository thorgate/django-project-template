from django.templatetags.static import static
from django.utils.html import escape, format_html

from wagtail.rich_text import LinkHandler


def global_admin_css():
    """
    https://learnwagtail.com/tutorials/adding-custom-css-and-javascript-to-your-wagtail-admin-area/

    When we need to add custom CSS or JS into admin. Had to disable as manifest static storage fails on lookup of missing
    static files.

    > admin-theme.css has yet to be created

    Usage: add to a wagtail_hooks.py the following:
    >>> from wagtail import hooks
    >>> hooks.register("insert_global_admin_css", fn=global_admin_css)

    :return:
    """
    return format_html(
        '<link rel="stylesheet" href="{}">', static("css/admin-theme.css")
    )


class NewWindowExternalLinkHandler(LinkHandler):
    """
    # ref: https://stackoverflow.com/a/55837744

    This specifies to do this override for external links only.
    Other identifiers are available for other types of links.

    Usage: add to a wagtail_hooks.py the following:
    >>> from wagtail import hooks
    >>> @hooks.register('register_rich_text_features')
    ... def register_external_link(features):
    ...    features.register_link_type(NewWindowExternalLinkHandler)
    """

    identifier = "external"

    @classmethod
    def expand_db_attributes(cls, attrs):
        """
        Add the target attr, and also rel="noopener" + noreferrer fallback.
        See https://github.com/whatwg/html/issues/4078 and
        https://pointjupiter.com/what-noopener-noreferrer-nofollow-explained/
        """
        return f'<a href="{escape(attrs["href"])}" target="_blank" rel="noopener noreferrer">'
