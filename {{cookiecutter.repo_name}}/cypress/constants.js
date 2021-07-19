export const URLS = {
    admin: '/adminpanel/',
    adminLogout: '/adminpanel/logout/',
    login: '{% if cookiecutter.frontend_style == "spa" %}/auth/login{% else %}/login/{% endif %}',
    logout: '{% if cookiecutter.frontend_style == "spa" %}/auth/logout{% else %}/logout/{% endif %}',
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
