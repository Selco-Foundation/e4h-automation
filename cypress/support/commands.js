


import LoginPage from '../pageObjects/loginPage';   // import path pageobject file

Cypress.Commands.add('login', (userType) => {
    const login = new LoginPage();       // Create an instance of Loginpage
    login.userLogin(userType);  
});
