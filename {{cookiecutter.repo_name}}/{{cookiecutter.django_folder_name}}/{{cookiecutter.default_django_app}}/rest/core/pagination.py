from collections import OrderedDict
from urllib import parse

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


def extract_from_query_string(url):
    _, _, _, query, _ = parse.urlsplit(url)
    return parse.parse_qs(query, keep_blank_values=True)


class CustomPageNumberPagination(PageNumberPagination):
    page_query_param = "pageNumber"
    alt_page_query_param = "page_number"
    page_size_query_param = "pageSize"
    alt_page_size_query_param = "page_size"
    page_size = 10

    @classmethod
    def _positive_int(cls, integer_string, strict=False, cutoff=None):
        """
        Cast a string to a strictly positive integer.
        """
        ret = int(integer_string)
        if ret < 0 or (ret == 0 and strict):
            raise ValueError()
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
                        (
                            extract_from_query_string(previous_link)
                            if previous_link
                            else None
                        ),
                    ),
                    (
                        "current",
                        {
                            self.page_query_param: self.page.number if self.page else 1,
                            self.page_size_query_param: (
                                paginator.per_page
                                if paginator
                                else CustomPageNumberPagination.page_size
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
                    return self._positive_int(
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
