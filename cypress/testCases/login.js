
import LoginPage from '../pageObjects/loginPage';   // import path pageobject file

describe('Login Tests', () => {
  const login = new LoginPage(); 
  it('should fail login with invalid credentials', () => {
    cy.login('invalidUser');

    // Validate error message
    cy.get('.error-message').should('contain.text', 'Invalid login credentials');
  });

  it('should successfully login with valid credentials', () => {
    cy.login('validUser');

    // Validate successful login
    cy.url().should('include', '/employee');  
    login.validate()
  });

});
