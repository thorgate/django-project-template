from django.http import HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.template import Context, Engine, loader, TemplateDoesNotExist
from django.utils.translation import gettext as _
from django.views.decorators.csrf import requires_csrf_token


def sentry_id_from_request(request):
    if getattr(request, "sentry", None) is not None:
        return request.sentry.get("id", None)

    return None


def page_not_found(request, exception, template_name="404.html"):
    context = {
        "request_path": request.path,
        "error": {
            "title": _("Page not found"),
            "message": _("We tried but couldn't find this page, sorry."),
        },
    }

    try:
        template = loader.get_template(template_name)
        body = template.render(context, request)
        content_type = None

    except TemplateDoesNotExist:
        template = Engine().from_string(
            "<h1>Not Found</h1>"
            "<p>The requested URL {% raw %}{{ request_path }}{% endraw %} was not found on this server.</p>"
        )
        body = template.render(Context(context))
        content_type = "text/html"

    return HttpResponseNotFound(body, content_type=content_type)


@requires_csrf_token
def server_error(request, template_name="500.html"):
    if (
        request.is_ajax()
        or request.META.get("HTTP_ACCEPT", "text/plain") == "application/json"
    ):
        return JsonResponse(
            {
                "sentry": sentry_id_from_request(request),
                "error": {"title": _("Something went wrong")},
            },
            status=500,
        )

    try:
        template = loader.get_template(template_name)
    except TemplateDoesNotExist:
        return HttpResponseServerError(
            "<h1>Server Error (500)</h1>", content_type="text/html"
        )

    message = _(
        "Something went wrong on our side... \n Please hold on while we fix it."
    ).replace("\n", "<br>")
    return HttpResponseServerError(
        template.render(
            {
                "sentry": sentry_id_from_request(request),
                "error": {
                    "title": _("Something went wrong"),
                    "message": message,
                    "sentry": _("Fault code: #"),
                },
            }
        )
    )
