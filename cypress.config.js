
const cypress = require("cypress");
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    env: {
      UATurl: "https://saura-emitra-uat.selcofoundation.org/digit-ui/employee/user/language-selection",
      Url_qa: "qa",
      Url_prod: "dev",
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    specPattern: ['cypress/testCases/*.js']
  },
});
