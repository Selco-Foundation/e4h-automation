
import LoginPage from '../pageObjects/loginPage';   // import path pageobject file

describe('Login Tests', () => {
  const login = new LoginPage(); 
  it('Validate that HCR User should able to login', () => {
    cy.login('HCRUserLogin');
      // Validate successful login
    cy.url().should('include', '/employee'); 
    login.validateHCR()
    
  });

  it('Validate that CRM User should able to login', () => {
    cy.login('CRMUserLogin');

    // Validate successful login
    cy.url().should('include', '/employee');  
    login.validateCRM()
  });

  it('Validate that TECNICIAN User should able to login', () => {
    cy.login('VenderLogin');

    // Validate successful login
    cy.url().should('include', '/employee');  
    login.validateVENDER()
  });

});
