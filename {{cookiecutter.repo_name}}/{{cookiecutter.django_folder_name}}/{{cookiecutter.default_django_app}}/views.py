from django.http import HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.shortcuts import render
from django.template import TemplateDoesNotExist
from django.utils.html import format_html
from django.utils.translation import gettext as _
from django.views.decorators.csrf import requires_csrf_token

from sentry_sdk import last_event_id


def page_not_found(request, exception, template_name="404.html"):
    try:
        context = {
            "request_path": request.path,
            "error": {
                "title": _("Page not found"),
                "message": _("We tried but couldn't find this page, sorry."),
            },
        }

        return render(request, template_name, context=context, status=404)

    except TemplateDoesNotExist:
        content = """
        <h1>Not Found</h1>
        <p>The requested URL {} was not found on this server.</p>
        """

        return HttpResponseNotFound(
            format_html(
                content,
                request.path,
            ),
            content_type="text/html",
        )


@requires_csrf_token
def server_error(request, template_name="500.html"):
    if (
        request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest"
        or request.META.get("HTTP_ACCEPT", "text/plain") == "application/json"
    ):
        return JsonResponse(
            {
                "sentry": last_event_id(),
                "error": {
                    "title": _("Something went wrong"),
                },
            },
            status=500,
        )

    try:
        messages = _(
            "Something went wrong on our side... \n Please hold on while we fix it."
        ).split("\n")

        return render(
            request,
            template_name,
            context={
                "sentry": last_event_id(),
                "error": {
                    "title": _("Something went wrong"),
                    "message": format_html("{}<br/>{}", *messages),
                    "sentry": _("Fault code: #"),
                },
            },
            status=500,
        )
    except TemplateDoesNotExist:
        sentry_id = last_event_id()

        message = "<h1>Server Error (500)</h1>"
        if sentry_id:
            message += format_html("\n<p>{}{}</p>", _("Fault code: #"), sentry_id)

        return HttpResponseServerError(message, content_type="text/html")
