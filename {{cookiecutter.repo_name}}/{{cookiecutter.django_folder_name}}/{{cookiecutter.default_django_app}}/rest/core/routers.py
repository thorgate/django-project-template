import typing as t

from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ViewSet


if t.TYPE_CHECKING:
    _ViewSetMixinBase = ViewSet
else:
    _ViewSetMixinBase = object


class CustomLookupMixin(_ViewSetMixinBase):
    """
    Allow viewset to override lookup regex in a more flexible way, for example, if two
    url kwargs are required instead of one
    """

    @classmethod
    def get_lookup_regex(cls, lookup_prefix="") -> str | None:
        return None


class BaseRouter(DefaultRouter):
    def __init__(self, *args, **kwargs):
        trailing_slash = kwargs.pop("trailing_slash", True)
        super().__init__(*args, **kwargs)
        if trailing_slash:
            self.trailing_slash = "/?"

    def get_lookup_regex(self, viewset, lookup_prefix=""):
        if issubclass(viewset, CustomLookupMixin):
            lookup_regex = viewset.get_lookup_regex(lookup_prefix)
            if lookup_regex is not None:
                return lookup_regex

        return super().get_lookup_regex(viewset, lookup_prefix)
