Feature('Login flow');


Scenario('Wrong credentials', (I) => {
    I.amOnPage('/login');
    I.refreshPage();
    I.see('Log in');
    I.fillField('Email', 'nobody@example.com');
    I.fillField('Password', 'Some password');
    I.click('Log in');
    I.see("Unable to login");
});


Scenario('Correct credentials', (I) => {
    I.amOnPage('/login');
    I.refreshPage();
    I.see('Log in');
    I.fillField('email', 'super@example.com');
    I.fillField('password', 'super');
    I.click('Log in');
    I.dontSee("Unable to login");
    I.see("super@example.com");
});
