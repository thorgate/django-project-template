import re
import typing
import uuid
from enum import Enum

from django.db.models.enums import ChoicesMeta
from django.urls import register_converter
from django.urls.converters import UUIDConverter
from django.utils.text import slugify

from generic.models import BaseModel


def text_choice_path_converter(
    choice_class: ChoicesMeta,
    manual_slug_to_choice: typing.Optional[dict[str, Enum]] = None,
):
    """
    Have you ever wished to simply to use a choice from a Choices Enum in a url Path?

    Now you can by simply using `register_choice_as_path` by passing in the Choces class, you can use it in your Paths!

    >>> from wagtail import hooks
    >>> from generic.choices_path_converter import register_choice_as_path
    >>> from meeting.constants import ReportType
    >>> from django.urls import path
    >>> @hooks.register("register_admin_urls")
    ... def register_additional_admin_urls():
    ...     register_choice_as_path(ReportType)

    >>> def view(request,report_type:ReportType):
    ...     assert isinstance(report_type, ReportType)
    ...     return [
    ...          path(
    ...              "<ReportType:report_type>",
    ...              view,
    ...              name="report_type",
    ...          ),
    ...      ]

    """

    class PathConverter:
        slug_to_choice: dict[str, typing.Any] = (
            {slugify(value): value for value, _ in choice_class.choices}
            if manual_slug_to_choice is None
            else manual_slug_to_choice
        )
        if len(slug_to_choice) != len(choice_class.choices):
            raise ValueError(
                f"Two or more choices in {choice_class} are clashing when slugify'd!"
            )
        regex = r"|".join(re.escape(choice) for choice in slug_to_choice.keys())

        def to_python(self, value):
            return self.slug_to_choice[value]

        def to_url(self, value: str):
            return slugify(value)

    return PathConverter


def register_choice_as_path(
    choice: ChoicesMeta, manual_slug_to_choice: typing.Optional[dict[str, Enum]] = None
):
    register_converter(
        text_choice_path_converter(choice, manual_slug_to_choice), choice.__name__
    )


def uuid_model_path_converter(model: typing.Type[BaseModel]):
    class PathConverter:
        regex = UUIDConverter.regex

        def to_python(self, value):
            # maybe should use just `objects`.. or do some is_subclass logic... shrug.
            return model.available_objects.get(pk=uuid.UUID(value))

        def to_url(self, value: BaseModel):
            return value.pk

    return PathConverter


def register_model_as_path(model: BaseModel, type_name=None):
    # untested but should work
    register_converter(uuid_model_path_converter(model), type_name or model.__name__)
