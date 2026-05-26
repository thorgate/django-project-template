from collections import OrderedDict
from urllib import parse

from django.core.paginator import EmptyPage, Page, Paginator
from django.utils.functional import cached_property

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


def extract_from_query_string(url):
    _, _, _, query, _ = parse.urlsplit(url)
    return parse.parse_qs(query, keep_blank_values=True)


class LimitlessPage(Page):
    """If no pagination is required, it is possible to save some execution time by not calculating the page size
    and using direct iteration instead of determining length."""

    ITERATOR_SIZE = 500

    def __len__(self):
        return 1

    def __iter__(self):
        return iter(self.object_list.iterator(self.ITERATOR_SIZE))


class LimitlessPaginator(Paginator):
    """Supports falling back to non-paginated queryset that still has same schema as paginated queryset, when
    -1 is specified as page size"""

    def __init__(self, object_list):
        super().__init__(
            object_list,
            1,
        )

    def validate_number(self, number):
        number = super().validate_number(number)
        if number != 0:
            raise EmptyPage(self.error_messages["no_results"])
        return number

    def get_page(self, number):
        return self.page(0)

    def page(self, number):
        return LimitlessPage(self.object_list, 0, self)

    @cached_property
    def count(self):
        return -1

    @cached_property
    def num_pages(self):
        return 0

    @property
    def page_range(self):
        return range(0)


class CustomPageNumberPagination(PageNumberPagination):
    page_query_param = "pageNumber"
    alt_page_query_param = "page_number"
    page_size_query_param = "pageSize"
    alt_page_size_query_param = "page_size"
    page_size = 10
    minus_one_as_unlimited = False

    @classmethod
    def _page_number_int(cls, integer_string, strict=False, cutoff=None) -> int | None:
        """
        Cast a string to a strictly positive integer.
        """
        ret = int(integer_string)
        if ret < 0 and cls.minus_one_as_unlimited:
            return None
        if ret < 0 or (ret == 0 and strict):
            raise ValueError
        if cutoff:
            return min(ret, cutoff)
        return ret

    def get_paginated_response_schema(self, schema):
        schema_obj = super().get_paginated_response_schema(schema)

        schema_obj["properties"]["nextUrl"] = schema_obj["properties"]["next"]
        schema_obj["properties"]["previousUrl"] = schema_obj["properties"]["previous"]

        schema_obj["properties"]["next"] = {
            "type": "object",
            "nullable": True,
            "properties": {
                self.page_query_param: {
                    "type": "integer",
                    "example": 3,
                },
                self.page_size_query_param: {
                    "type": "integer",
                    "example": 10,
                },
            },
        }
        schema_obj["properties"]["previous"] = {
            "type": "object",
            "nullable": True,
            "properties": {
                self.page_query_param: {
                    "type": "integer",
                    "example": 1,
                },
                self.page_size_query_param: {
                    "type": "integer",
                    "example": 10,
                },
            },
        }
        schema_obj["properties"]["totalCount"] = schema_obj["properties"]["count"]
        del schema_obj["properties"]["count"]

        schema_obj["properties"]["current"] = {
            "type": "object",
            "nullable": True,
            "properties": {
                self.page_query_param: {
                    "type": "integer",
                    "example": 1,
                },
                self.page_size_query_param: {
                    "type": "integer",
                    "example": 10,
                },
            },
        }

        schema_obj["properties"].update(
            {
                self.page_query_param: {
                    "type": "integer",
                    "example": 1,
                },
                self.page_size_query_param: {
                    "type": "integer",
                    "example": 10,
                },
            },
        )

        return schema_obj

    def get_paginated_response(self, data):
        next_link = self.get_next_link()
        previous_link = self.get_previous_link()

        if self.page:
            paginator = self.page.paginator
        else:
            paginator = None

        return Response(
            OrderedDict(
                [
                    ("totalCount", paginator.count if paginator else 0),
                    ("nextUrl", next_link),
                    (
                        "next",
                        extract_from_query_string(next_link) if next_link else None,
                    ),
                    ("previousUrl", previous_link),
                    (
                        "previous",
                        (extract_from_query_string(previous_link) if previous_link else None),
                    ),
                    (
                        "current",
                        {
                            self.page_query_param: self.page.number if self.page else 1,
                            self.page_size_query_param: (
                                paginator.per_page if paginator else CustomPageNumberPagination.page_size
                            ),
                        },
                    ),
                    ("results", data),
                ]
            )
        )

    def get_page_size(self, request):
        if self.page_size_query_param:
            for page_size_query_param in [
                self.page_size_query_param,
                self.alt_page_size_query_param,
            ]:
                try:
                    return self._page_number_int(
                        request.query_params[page_size_query_param],
                        strict=True,
                        cutoff=self.max_page_size,
                    )
                except (KeyError, ValueError):
                    pass

        return self.page_size

    def get_page_number(self, request, paginator):
        page_number = request.query_params.get(
            self.page_query_param,
            request.query_params.get(self.alt_page_query_param, 1),
        )
        if page_number in self.last_page_strings:
            page_number = paginator.num_pages
        return page_number

    def paginate_queryset(self, queryset, request, view=None):
        paginated = super().paginate_queryset(queryset, request, view)
        if paginated is not None:
            return paginated

        # This happens when page size is None, which means limitless pagination
        paginator = LimitlessPaginator(queryset)
        self.page = paginator.page(0)
        return self.page
