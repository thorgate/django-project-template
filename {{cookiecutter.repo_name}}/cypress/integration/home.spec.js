import { testAccount, URLS } from '../constants';

describe('Home page', () => {
    it('Renders a home page', () => {
        cy.visit('/');
        cy.get('a.navbar-brand').invoke('attr', 'href').should('equal', '/');
        cy.get(`a.nav-link[href='${URLS.login}']`).should('exist');
        cy.get(`a.nav-link[href='${URLS.logout}']`).should('not.exist');
    });
});
