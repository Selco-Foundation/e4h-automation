const { test, expect } = require("@playwright/test");
import * as path from "path";

exports.HCR_FUNCTIONALITY = class HCR_FUNCTIONALITY {
  constructor(page) {
    this.page = page;
    this.Newticketlink = page.locator("//a[normalize-space()='New Ticket']");
    this.Tickettype = page.locator("//div[6]//div[1]//div[1]//div[1]//input[1]");
    this.ticket_Subtype = page.locator("//body[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/div[1]/div[1]/div[1]/div[1]/form[1]/div[1]/div[7]/div[1]/div[1]/div[1]/input[1]");
    this.Comment = page.locator("//input[@name='comments']");
    this.FileUpload = page.locator("(//input[@id='document-15'])[1]");
    this.Submitticket_Buttton = page.locator("/header[normalize-space()='Submit Ticket']");
    this.Confirmationmessage = page.locator("//header[normalize-space()='Ticket Submitted']");
    this.gotohomebutton = page.locator("//header[normalize-space()='Go To Home']");
    this.InboxOption = page.locator("//a[normalize-space()='Inbox']");
    this.TicketID = page.locator("div[class='emp-success-wrap'] div p");
    this.SearchBox = page.locator("//input[@name='serviceRequestId']");
    this.searchButton = page.locator("//header[normalize-space()='Search']");
    this.ticketResult = page.locator("td[role='cell'] div");
    this.submitTicketButton = page.locator("(//header[normalize-space()='Submit Ticket'])[1]");
    this.logoutbutton=page.locator("(//*[name()='svg'])[3]");
    this.logoutOption=page.locator("//span[contains(text(),'Logout')]")
    this.logoutconfirm= page.locator("//button[@class='selector-button-primary']")
    this.statusfilterALL=page.locator("//body/div[@id='root']/div/div[@class='body-container']/div[@class='employee']/div[@class='main ']/div[@class='employee-app-wrapper']/div[@class='ground-container']/div[@class='employee-app-container']/div[@class='ground-container']/div/div[@class='inbox-container']/div[@class='filters-container']/div/div[@class='filter']/div[@class='filter-card']/div/div[@class='status-container']/div[2]");
    this.ResolvedFilterCHeckbox= page.locator("//input[contains(@value, 'Resolved')]");
    this.tableheading=page.locator("(//th[normalize-space()='Ticket No.'])[1]");
    this.ticketstaus=page.locator("(//span[contains(text(),'Resolved')])[1]");
    this.clearbutton= page.locator("(//label[normalize-space()='Clear'])[1]");
    this.logo=page.locator("//img[@class='bannerLogo']");
    this.resolvedticket=page.locator("(//a[contains(normalize-space(), 'KA')])[1]");
    this.takeactionbutton=page.locator("(//header[normalize-space()='Take Action'])[1]");
    this.reopenbutton= page.locator("(//p[contains(@class,'custom-p')])[1]");
    this.reopenformheading=page.locator("(//h1[normalize-space()='Re-Open Ticket'])[1]");
    this.reopenReason=page.locator("(//input[@type='text'])[1]");
    this.reopencomment=page.locator("(//textarea[@name='comment'])[1]");
    this.FinalReopenButton=page.locator("(//button[@class='selector-button-primary'])[1]");
    this.reopensuccesstoast=page.locator("(//div[contains(@class,'toast-success')])[1]");
    this.inboxnew=page.locator("(//a[normalize-space()='Inbox'])[1]")
    this.SLAdayscount=page.locator("(//span[@class='sla-cell-success'])[1]")

  }

  //Ticket creation Process

  async Ticket_Creation(Tickettype_Name, TicketSUBtype_Name, comments) {
    await this.Newticketlink.click();
    //Select ticket type
    await this.Tickettype.click();
    await this.page.keyboard.type(Tickettype_Name);
    await this.page.waitForTimeout(500);
    await this.page.getByText(Tickettype_Name, { exact: true }).click();
    await this.page.waitForTimeout(5000);
    //Select Ticket_Subtype
    await this.ticket_Subtype.click();
    await this.page.keyboard.type(TicketSUBtype_Name);
    await this.page.waitForTimeout(500);
    await this.page.getByText(TicketSUBtype_Name, { exact: true }).click();
    await this.Comment.fill(comments);
    // Upload a file
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.page.locator("input.input-mirror-selector-button").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([
      path.join("./fileUploads", "Selcoimage.png"),
      path.join("./fileUploads", "selco2.png"),
    ]);
    await this.page.waitForTimeout(3000);
    await this.submitTicketButton.waitFor({ state: "visible" });
    await this.submitTicketButton.click();
    // Capture and return the dynamically generated ticket ID
    const id = await this.TicketID.textContent();
    console.log(`Created Ticket ID: ${id}`);
    return id;
  }

  async Success_Confirmation(Expected_successtoast) {
    const locator = this.Confirmationmessage;
    await expect(locator).toBeVisible();
  }

  async Goto_HOME() {
    await this.gotohomebutton.click();
    await this.page.waitForTimeout(3000);
    await this.InboxOption.click();
    const locator = this.page.locator("//header[normalize-space()='Inbox']");
    await expect(locator).toBeVisible();
  }

  async Searchticket(Ticketnumber) {
    await this.SearchBox.fill(Ticketnumber);
    await this.searchButton.click();
    await this.page.waitForTimeout(2000); // Optional: wait for results
    await this.ticketResult.waitFor();
    // Verify that the ticket appears in the inbox
    await expect(this.ticketResult).toBeVisible();
    await expect(this.ticketResult).toContainText(Ticketnumber);
    //SLA days verification
    const SLAdays= await this.SLAdayscount.textContent();
    console.log("SLA days remaining = ", SLAdays);
    const SLAdayscountinNumber = parseInt(SLAdays.trim(), 10)
    if (SLAdayscountinNumber !==10)
      {
      console.error('SLA days mismatch: Expected 10, but got ${SLAdayscountinNumber}');
    }
    else{
      console.log("SLA days is correct");
    }
  }

async Status_functionality()
//Verify all the status filter and Reopoen one Resolved ticket
{
await this.clearbutton.click();
const AllstatusFiltername= await this.statusfilterALL.textContent();
console.log("all status filter name = ", AllstatusFiltername);
await this.ResolvedFilterCHeckbox.click();
const tableheadingname= this.page.getByRole('columnheader', { name: 'Ticket No.' });
//await expect(tableheadingname).toBeVisible();

}
async logo_validation()
{
   const logos = await this.logo; // Adjust selector as needed
   await expect(logos).toHaveCount(3);
   await this.page.screenshot({ path: 'Screenshot/logo.png' });
}

async logout(ExpectedloginURL)
  {
      await this.logoutbutton.click();
      await this.logoutOption.click();
      await this.page.waitForSelector("(//h1[normalize-space()='Logout'])[1]");
      await this.logoutconfirm.click();
      await expect(this.page).toHaveURL(ExpectedloginURL);
   }


async Reopen_Ticket(reopenreasontext,reopencomment)
 {
await this.inboxnew.click();
await this.ResolvedFilterCHeckbox.click();
const tableheadingname= this.page.getByRole('columnheader', { name: 'Ticket No.' });
await expect(tableheadingname).toBeVisible();
await expect(this.ticketstaus).toBeVisible();
await this.resolvedticket.click();
await this.takeactionbutton.click();
await this.reopenbutton.click();
await expect(this.reopenformheading).toBeVisible();
await this.reopenReason.click();
await this.reopenReason.fill(reopenreasontext);
await this.page.getByText(reopenreasontext, {exact: true}).click();
await this.reopencomment.fill(reopencomment);
// Upload a file
const fileChooserPromise = this.page.waitForEvent("filechooser");
await this.page.locator("(//input[@class='input-mirror-selector-button'])").click();
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles(path.join("./fileUploads", "Selcoimage.png"))
await this.FinalReopenButton.click();
await expect(this.reopensuccesstoast).toBeVisible();

 }

};
