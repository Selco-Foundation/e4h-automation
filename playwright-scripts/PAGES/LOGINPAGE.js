const { expect } = require("@playwright/test");

exports.LOGINPAGE = class LOGINPAGE {
  constructor(page) {
    this.page = page;
    this.usernameinput = page.locator("//input[@name='username']");
    this.passwordinput = page.locator("//input[@name='password']");
    this.healthcarecenter = page.locator("(//input[@class='employee-select-wrap--elipses undefined'])[1]");
    this.healthcarecenterOptions = page.locator("//div[@class='cp profile-dropdown--item display: flex ']//span");
    this.loginbutton = page.locator("//header[normalize-space()='CONTINUE']");
  }

async login(username, password, centerName) {
    await expect(this.usernameinput).toBeVisible();
    await this.usernameinput.fill(username);
    await this.passwordinput.fill(password);
    // Healthcare center drop-down selection
    await this.healthcarecenter.click();
    await this.page.keyboard.type(centerName);
    await this.page.waitForTimeout(500);
    await this.page.getByText(centerName, { exact: true }).click();
    await this.page.waitForTimeout(5000);
    await this.loginbutton.click();
  }

async verifyURL(expectedURL) 
  {
    await expect(this.page).toHaveURL(expectedURL);
  }

async isTextPresent(expectedText) 
  {
    const locator = this.page.locator("//p[@class='ulb']");
    await expect(locator).toBeVisible();
  }
};
