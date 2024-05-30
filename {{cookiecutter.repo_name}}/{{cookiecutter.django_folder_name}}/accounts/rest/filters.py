from django.forms import NullBooleanField
from django.http import QueryDict

import django_filters
from django_filters.fields import BaseCSVField
from django_filters.widgets import BaseCSVWidget

from accounts.models import User
from {{cookiecutter.default_django_app}}.rest.core.filters import BaseFilterSet


class BooleanBaseCSVWidget(BaseCSVWidget):
    def value_from_datadict(self, data, files, name):
        if not isinstance(data, QueryDict):
            return super().value_from_datadict(data, files, name)

        boolean_field = NullBooleanField()
        return [boolean_field.to_python(value) for value in data.getlist(name)]


class BooleanBaseCSVField(BaseCSVField):
    base_widget_class = BooleanBaseCSVWidget


class BooleanInFilter(django_filters.BaseInFilter, django_filters.BooleanFilter):
    base_field_class = BooleanBaseCSVField


class UserFilterSet(BaseFilterSet):
    search_fields = ["email_deterministic", "name"]
    sorting_fields = ["email", "name"]
    is_staff_in = BooleanInFilter(field_name="is_staff")
    email = django_filters.CharFilter(field_name="email_deterministic")

    class Meta:
        model = User
        # Is staff in could be used in same way as is_staff, but is given here as showcase
        # TODO: NEWPROJECT - keep only relevant filters here
        fields = ["name", "is_active", "is_staff_in", "is_staff"]
