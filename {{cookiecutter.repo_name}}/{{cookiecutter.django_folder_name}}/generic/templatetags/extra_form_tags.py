from typing import Optional

from django import template
from django.forms import Form


register = template.Library()


@register.simple_tag
def form_field(
    form: Form,
    *field_name_parts,
    join_symbol: Optional[str] = None,
    prefix: Optional[str] = None,
):
    """
    Get bound field from the form by dynamic key (field name).
    """
    if not join_symbol:
        join_symbol = ""
    if not prefix:
        prefix = ""
    for bound_field in form:
        if (
            bound_field.name
            == f"{prefix}{join_symbol.join(str(part) for part in field_name_parts)}"
        ):
            return bound_field
