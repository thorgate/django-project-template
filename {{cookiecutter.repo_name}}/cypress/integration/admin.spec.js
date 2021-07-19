import { adminAccount, URLS } from '../constants';

describe('Admin Authorization', () => {
    it('Allows the admin to log in to admin panel', () => {
        cy.visit(URLS.admin);
        cy.get('input#id_username').type(adminAccount.email);
        cy.get('input#id_password').type(adminAccount.password);
        cy.get('input[type=submit]').click();
        // On successful login, we are redirected to Home
        cy.location('pathname').should('eq', URLS.admin)
    });
});
