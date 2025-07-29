const { test, expect } = require("@playwright/test");
import * as path from "path";

exports.statespoc= class statespoc {
  constructor(page)
  {

    this.page=page;

    this.Inboxoption_statespoc= page.locator("(//a[normalize-space()='Inbox'])[1]");
    this.statespocfilter=page.locator("//input[starts-with(@value, 'Out of Warranty - Pending with State SPOC')]"); 
    this.TABLEheading=page.locator("(//th[normalize-space()='Ticket No.'])[1]");
    this.Topappearedticketinspoc=page.locator("(//a[contains(@href, 'KA-RCH')])[1]")
    this.ticketstatusforoutofwarranty=page.locator("(//p[normalize-space()='Out of Warranty - Pending with State SPOC'])[1]");
    this.TakeActionBUtton= page.locator("(//header[normalize-space()='Take Action'])[1]");
    this.Assign=page.locator("(//p[@class='custom-p'])[1]");
    this.AssignFormheading=page.locator("(//h1[normalize-space()='Assign Ticket'])[1]");
    this.Assignedropdownforstatespoc=page.locator("(//input[@type='text'])[1]");
    this.AssigneComment=page.locator("(//textarea[@name='comment'])[1]");
    this.uploadsupportingDoc=page.locator("(//div[contains(text(),'Upload')])[1]");
    this.AssignfinalButton=page.locator("(//h2[normalize-space()='Assign'])[1]");
    this.LogoutButton=page.locator("(//div[@class='cp flex-right column-gap-5'])[3]");
    this.logoutOption=page.locator("//span[contains(text(),'Logout')]")
    this.logoutconfirm= page.locator("//button[@class='selector-button-primary']")
  }


  async TakeActionOnOUTOFWARRANTY_Ticket(Vendorname,outofwarrantycomment)
  {

     await this.Inboxoption_statespoc.click();
    // await this.statespocfilter.click();
     //await this.page.waitForTimeout(2000);

    //  const Tableheadings= await this.TABLEheading();
    //  await expect(Tableheadings).toBeVisible();

     await this.Topappearedticketinspoc.click();
     await this.TakeActionBUtton.click();
     await this.Assign.click();

     const Formheadingforoutofwarranty= await this.AssignFormheading;
     await expect(Formheadingforoutofwarranty).toBeVisible();
     await this.Assignedropdownforstatespoc.click();
     await this.Assignedropdownforstatespoc.fill(Vendorname)
     await this.page.getByText(Vendorname, { exact: true }).click();

     await this.AssigneComment.fill(outofwarrantycomment)

     const fileChooserPromise = this.page.waitForEvent("filechooser");
        await this.page.locator("(//div[contains(text(),'Upload')])[1]").click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(path.join("./fileUploads", "selco2.png"));

    await this.AssignfinalButton.click();

    await this.page.screenshot({path: 'Screenshot/outofwarrantyassign.png'});

  }

  async Logout_statespoc(ExpectedloginURL)
  
  {
       await this.LogoutButton.click();
       await this.logoutOption.click();
       await this.page.waitForSelector("(//h1[normalize-space()='Logout'])[1]");
       await this.logoutconfirm.click();
       await expect(this.page).toHaveURL(ExpectedloginURL);

  }






































}