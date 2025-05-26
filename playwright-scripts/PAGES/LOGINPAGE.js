const { expect } = require("@playwright/test");

exports.LOGINPAGE = class LOGINPAGE {
  constructor(page) {
    this.page = page;
    this.usernameinput = page.locator("//input[@name='username']");
    this.passwordinput = page.locator("//input[@name='password']");
    this.healthcarecenter = page.locator("(//input[@class='employee-select-wrap--elipses undefined'])[1]");
    this.healthcarecenterOptions = page.locator("//div[@class='cp profile-dropdown--item display: flex ']//span");
    this.loginbutton = page.locator("//header[normalize-space()='CONTINUE']");
    this.forgotpassword=page.locator("(//button[normalize-space()='Forgot Password?'])[1]");
    this.forgotpasswdheading=page.locator("(//h1[normalize-space()='Need Help with Your Credentials?'])[1]")
    this.mailadress=page.locator("(//span[normalize-space()='karnatakacrm@selcofoundation.org'])[1]");
    this.oKBUTTON=page.locator("(//h2[normalize-space()='OK'])[1]");
  }

async login(username, password, centerName) {
    await expect(this.usernameinput).toBeVisible();
    await this.usernameinput.fill(username);
    await this.passwordinput.fill(password);
  
    // Set up dialog handler BEFORE triggering the action
    this.page.once('dialog', async dialog => {
    await expect(dialog.type()).toBe('alert');
    await expect(dialog.message()).toContain("Please select a Health Care");
    await dialog.accept();
  });

  await this.loginbutton.click();

    // Healthcare center drop-down selection
    await this.healthcarecenter.click();
    await this.page.keyboard.type(centerName);
    await this.page.waitForTimeout(500);
    await this.page.getByText(centerName, { exact: true }).click();
    await this.page.waitForTimeout(2000);
    await this.loginbutton.click();
  }

async verifyURL(expectedURL) 
  {
    await expect(this.page).toHaveURL(expectedURL);
  }

async isTextPresent() 
  {
    const locator = this.page.locator("//p[@class='ulb']");
    await expect(locator).toBeVisible();
  }

  async Forgotpassword()
  {
    await this.forgotpassword.click();
    await expect(this.forgotpasswdheading).toBeVisible();
    const heading= await this.forgotpasswdheading.textContent();
    console.log(heading);
    await this.mailadress.click();
    await this.oKBUTTON.click()
  }
};
