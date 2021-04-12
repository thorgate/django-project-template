// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// module.exports = (on, config) => {
//     // `on` is used to hook into various events Cypress emits
//     // `config` is the resolved Cypress config
//     // on("task", {
//     //     generateOTP: require("cypress-otp")
//     // });
// };
import { testAccount, adminAccount, URLS } from '../constants';

Cypress.Commands.add('login', () => {
    cy.visit(URLS.login);
    // - {% if cookiecutter.frontend_style == "spa" %}
    cy.get('input#email').clear().type(testAccount.email);
    cy.get('input#password').clear().type(testAccount.password);
    cy.get('button[type=submit]').click();
    // - {% else %}
    cy.get('#id_username').clear().type(testAccount.email);
    cy.get('#id_password').clear().type(testAccount.password);
    cy.get('input[type=submit]').click();
    // - {% endif %}
    cy.location('pathname').should('eq', '/');
});

Cypress.Commands.add('logout', () => {
    cy.visit(URLS.logout);
});

Cypress.Commands.add('adminLogin', () => {
    cy.visit(URLS.admin);
    cy.get('#id_username').clear().type(adminAccount.email);
    cy.get('#id_password').clear().type(adminAccount.password);
    cy.get('input[type=submit]').click();
    cy.location('pathname').should('eq', URLS.admin);
});

Cypress.Commands.add('adminLogout', () => {
    cy.visit(URLS.adminLogout);
});
