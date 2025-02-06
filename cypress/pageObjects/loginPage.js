class LoginPage {

    slectLanguage = '.submit-bar'
    userName = 'input[name="username"]'
    password = 'input[name="password"]'
    healthCareCenter = '.employee-select-wrap--elipses.undefined'
    selectCenter = '#jk-dropdown-unique > :nth-child(1)'
    submit = 'button[type="submit"]'

    userLogin(userType) {
        cy.fixture('loginData').then((data) => {
            const user = data[userType];           // Fetch login detsils from fixture file details 

            
            cy.visit("https://saura-emitra-uat.selcofoundation.org/digit-ui/employee/user/language-selection");
            cy.get(this.slectLanguage).click();
            cy.get(this.userName).type(user.username);
            cy.get(this.password).type(user.password);
            cy.get(this.healthCareCenter).type(user.centre).click(); 
            cy.get(this.selectCenter).click();
            cy.get(this.submit).click();
        });
    }

    centreName = '.ulb'
    
    validate(){
        cy.get(this.centreName).should('be.visible').and('contain.text', 'TENANT_TENANTS_PG_DUMMY');
    }
}

export default LoginPage; // Ensure correct export
