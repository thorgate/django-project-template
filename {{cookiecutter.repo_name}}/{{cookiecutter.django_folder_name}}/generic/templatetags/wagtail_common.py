import typing

from django.template import Library

from wagtail.models import Locale, Page, TranslatableMixin
from wagtail.templatetags.wagtailcore_tags import pageurl


register = Library()


@register.simple_tag(takes_context=True)
def safe_pageurl(
    context, page: typing.Optional[Page], fallback: typing.Optional[str] = None
):
    """
    wagtails pageurl has s flaw where when you pass in empty string to the page argument it will not use fallback,
    but rather error. This tag is a workaround for that.
    Main case is that "" is the return value when referencing a page that doesn't exist in the context.
    Such as {% raw %}{% safe_pageurl page.get_site.root_page fallback="/" %}{% endraw %} if this was in a patterns-library template it would error.
    """
    if not page and fallback:
        return pageurl(context, None, fallback)
    return pageurl(context, page, fallback)


@register.simple_tag(takes_context=True)
def safe_pageurl_localized(
    context, page: typing.Optional[Page], fallback: typing.Optional[str] = None
):
    """
    There doesn't seem to be a simple way to have pageurl return the localized url or the fallback if there's no translation.
    """
    if not page and fallback:
        return pageurl(context, None, fallback)
    if isinstance(page, TranslatableMixin):
        page = page.get_translation_or_none(Locale.get_active())
        if page is not None and not page.live:
            page = None
    return pageurl(context, page, fallback)
