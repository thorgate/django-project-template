export const URLS = {
    admin: '/adminpanel/',
    adminLogout: '/adminpanel/logout/',
    // - {% if cookiecutter.frontend_style == SPA %}
    // -     {% set login_url="/auth/login" %}
    // -     {% set logout_url="/auth/logout" %}
    // - {% elif cookiecutter.frontend_style == WEBAPP %}
    // -     {% set login_url="/login" %}
    // -     {% set logout_url="/logout" %}
    // - {% endif %}
    login: '{{ login_url }}',
    logout: '{{ logout_url }}',
};

export const adminAccount = {
    email: 'cypress-admin@localhost.localdomain',
    password: 'admin',
};

// to begin with, it's enough to use the same account as the admin account.
export const testAccount = {
    email: 'cypress-admin@localhost.localdomain',
    password: 'admin',
};
