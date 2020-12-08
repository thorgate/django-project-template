import '../../../static/styles-src/main.scss';

global.django = {
    // Translation functions are provided by djangos jsi18n and are global
    // some very simple implementations here based on the ones from jsi18n
    gettext: (text) => text,
    ngettext: (a, b, count) => (count === 1 ? a : b),
    interpolate: (fmt, obj, named) => {
        if (named) {
            return fmt.replace(/%\(\w+\)s/g, (match) =>
                String(obj[match.slice(2, -2)])
            );
        } else {
            return fmt.replace(/%s/g, () => String(obj.shift()));
        }
    },
    pgettext: (context, msgid) => {
        let value = global.django.gettext(`${context}\x04${msgid}`);
        if (value.indexOf('\x04') !== -1) {
            value = msgid;
        }
        return value;
    },
    reverseUrl: (name) => name,
};

global.DJ_CONST = {
    user: {
        id: 1,
        email: 'r@r.ee',
        name: 'Example User',
    },
    PROJECT_TITLE: '{{ cookiecutter.project_title }}',
    SITE_URL: '127.0.0.1:8000',
    STATIC_URL: '/static/',
};
global.DJ_CONST['reverse'] = (text) => text;
