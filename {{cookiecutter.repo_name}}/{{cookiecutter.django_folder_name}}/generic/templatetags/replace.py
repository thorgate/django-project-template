from django.template import Library


register = Library()


@register.filter
def replace(value, arg):
    """
    Replacing filter
    Use {% raw %}`{{ "text-center"|replace:"text-center|text-left" }}`{% endraw %}
    """
    if len(arg.split("|")) != 2:
        return value

    what, to = arg.split("|")
    return value.replace(what, to)
