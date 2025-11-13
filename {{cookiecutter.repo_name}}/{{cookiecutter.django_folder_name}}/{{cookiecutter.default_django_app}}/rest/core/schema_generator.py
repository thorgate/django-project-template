from drf_spectacular import openapi

from .viewsets import ExtraFilteredActionsMixin


class AutoSchema(openapi.AutoSchema):
    def get_filter_backends(self):
        if isinstance(self.view, ExtraFilteredActionsMixin) and self.view.action in self.view.extra_filtered_actions:
            return getattr(self.view, "filter_backends", [])

        return super().get_filter_backends()
