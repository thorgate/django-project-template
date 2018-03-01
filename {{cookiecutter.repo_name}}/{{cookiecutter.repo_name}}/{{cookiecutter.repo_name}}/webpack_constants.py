from django.conf import settings

from tg_react.apiurls import flatten_urls
from tg_react.language import constants as _base_language_constants


def constants(context):
    output = {
        key: getattr(settings, key, None)
        for key in settings.SETTINGS_EXPORT
    }

    api_base = settings.API_BASE

    output.update({
        'API_BASE': f'{settings.SITE_URL if settings.DEBUG else ""}{api_base}',
        'KOA_API_BASE': f'{settings.KOA_SITE_BASE if settings.KOA_SITE_BASE else ""}{api_base}',

        'API': flatten_urls('{{cookiecutter.repo_name}}.api_urls', ''),
    })
    return output


def language_constants(context):
    res = _base_language_constants(context=context)

    # Add ordering for languages
    res['LANGUAGE_ORDER'] = list(sorted(res['LANGUAGES'].keys(), key=lambda x: (x == 'en', x == 'et'), reverse=True))

    return res
