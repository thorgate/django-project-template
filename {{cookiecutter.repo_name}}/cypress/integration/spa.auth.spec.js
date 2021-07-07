import { testAccount, URLS } from '../constants';

const restrictedURL = '/restricted';

describe('Authorization', () => {
    it('Redirects anonymous user to the login page on accessing the restricted view', () => {
        cy.visit(restrictedURL);
        cy.location('pathname').should('eq', URLS.login)
    });
    it('Allows a regular user to log in', () => {
        cy.visit('/');
        cy.get(`a.nav-link[href='${URLS.login}']`).should('exist');
        cy.get(`a.nav-link[href='${URLS.login}']`).click();
        cy.location('pathname').should('eq', URLS.login)
        cy.get('input#email').type('bad email');
        cy.get('button[type=submit]').invoke('attr', 'disabled').should('eq', 'disabled');
        cy.get('input#email').clear().type(testAccount.email);
        cy.get('input#password').type(testAccount.password);
        cy.get('button[type=submit]').invoke('attr', 'disabled').should('eq', undefined);
        cy.get('button[type=submit]').click();
        // On successful login, we are redirected to Home
        cy.location('pathname').should('eq', '/')
        cy.get(`a.nav-link[href='${URLS.login}']`).should('not.exist');
        cy.get(`a.nav-link[href='${URLS.logout}']`).should('exist');
    });
    it('Allows a logged in user to access the restricted view', () => {
        cy.login();
        cy.visit(restrictedURL);
        cy.location('pathname').should('eq', restrictedURL);
        cy.title().should('eq', 'Example - test project');
    });
});
