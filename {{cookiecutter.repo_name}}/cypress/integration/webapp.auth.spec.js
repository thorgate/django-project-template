import { testAccount, URLS } from '../constants';

describe('Authorization', () => {
    it('Allows a regular user to log in', () => {
        cy.visit(URLS.login);
        cy.get('input#id_username').type(testAccount.email);
        cy.get('input#id_password').type(testAccount.password);
        cy.get('input[type=submit]').click();
        // On successful login, we are redirected to Home
        cy.location('pathname').should('eq', '/')
        cy.get(`a.nav-link[href='${URLS.login}']`).should('not.exist');
        cy.get(`a.nav-link[href='${URLS.logout}']`).should('exist');
    });
});
