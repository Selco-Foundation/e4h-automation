import {test, expect} from '@playwright/test'
import * as path from "path";


exports.Vendor_Module =
class Vendor_Module{
constructor(page){
this.page= page;
this.ContinueBUtton=page.locator("(//header[normalize-space()='CONTINUE'])[1]")
this.usernameinput= page.locator("//input[@name='username']");
this.passwordinput= page.locator("//input[@name='password']");
this.healthcarecenterlogin= page.locator("(//input[@class='employee-select-wrap--elipses undefined'])[1]");
this.loginbutton= page.locator("//header[normalize-space()='CONTINUE']")
this.inboxOption=page.locator("(//a[normalize-space()='Inbox'])[1]")
this.pageheading1=page.locator("(//span[@class='text removeHeight'])[1]")
this.Topappearedticket=page.locator("(//a[contains(@href, 'KA-RCH')])[1]")
this.tableheading=page.locator("(//th[normalize-space()='Ticket No.'])[1]");
this.pendingforResolutionStatus= page.locator("(//p[normalize-space()='Pending Resolution'])[1]")
this.takeActionbutton1=page.locator("(//header[normalize-space()='Take Action'])[1]")
this.resolvebutton= page.locator("(//p[normalize-space()='Resolve'])[1]")
this.Resolveformheading=page.locator("(//h1[normalize-space()='Resolve Ticket'])[1]")
this.Commentbox1=page.locator("(//textarea[@name='comment'])[1]")
this.finalResolvebutton=page.locator("(//button[@class='selector-button-primary'])[1]")
this.successtoast=page.locator("(//div[@class='toast-success'])[1]")
this.backbutton1=page.locator("(//a[normalize-space()='Back'])[1]")
this.sendbackbutton=page.locator("(//p[normalize-space()='Sendback'])[1]")
this.senbackformheading= page.locator("(//h1[normalize-space()='Sendback'])[1]");
this.sendbackreasondropdown=page.locator("(//input[@type='text'])[1]");
this.finalsendbackbutton=page.locator("(//button[@class='selector-button-primary'])[1]")
this.logoutbutton=page.locator("(//*[name()='svg'])[3]");
this.logoutOption=page.locator("//span[contains(text(),'Logout')]")
this.logoutconfirm= page.locator("//button[@class='selector-button-primary']")
this.Currentownername=page.locator("//tbody/tr[1]/td[6]/span[1]");
this.outOfWarranty=page.locator("(//p[normalize-space()='Out of Warranty'])[1]");
this.outofwarrantyformheading= page.locator("(//h1[normalize-space()='Out of Warranty'])[1]");
this.outofwarrantyComment=page.locator("(//textarea[@name='comment'])[1]");
this.outofwannatyUPLOAD=page.locator("(//div[contains(text(),'Upload')])[1]");
this.outofwarrantyBUtton=page.locator("(//h2[normalize-space()='Out of Warranty'])[1]");
this.outofwarrantypendingResolutionfilter=page.locator("//input[starts-with(@value, 'Out of Warranty - Pending with Vendor for Resolution')]");


}

async Vendor_Login(username2,password2,Healthcarecenter2)
{
    await this.page.waitForSelector("//input[@name='username']")
    await this.usernameinput.fill(username2);
    await this.passwordinput.fill(password2);
    await this.healthcarecenterlogin.click();
    await this.page.keyboard.type(Healthcarecenter2);
    await this.page.waitForTimeout(500);
    await this.page.getByText(Healthcarecenter2, { exact: true }).click();
    await this.loginbutton.click();
    const pageheading= await this.pageheading1;
    await expect(pageheading).toBeVisible();

}

async Resolve_Ticket()
 {
await this.inboxOption.click();
const tableheadingvisible= await this.tableheading;
await expect(tableheadingvisible).toBeVisible();
const CurrentownernameINTable= await this.Currentownername.textContent();
const Actualcurrentowner= "Selco India";
if(CurrentownernameINTable==Actualcurrentowner)
{
    console.log("current owner is correct")
}
await this.Topappearedticket.click();
const ticketstatus= this.pendingforResolutionStatus;
await expect(ticketstatus).toBeVisible();
await this.takeActionbutton1.click();
await this.resolvebutton.click();
const formheading= await this.Resolveformheading;
await expect(formheading).toBeVisible();
await this.Commentbox1.fill("Test comment");
const fileChooserPromise = this.page.waitForEvent("filechooser");
await this.page.locator("(//div[contains(text(),'Upload')])[1]").click();
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles(path.join("./fileUploads", "dummy.pdf") );
await this.page.waitForSelector("(//div[@class='tag'])[1]");
await this.finalResolvebutton.click();
const resolvesuccess= await this.successtoast;
await expect(resolvesuccess).toBeVisible();
await this.page.screenshot({ path: 'Screenshot/resolvedticket.png' });
 }


async Sendbackticket()
{

await this.backbutton1.click();
await this.page.waitForTimeout(2000);
const tableheadingvisible1= await this.tableheading;
await expect(tableheadingvisible1).toBeVisible();
await this.Topappearedticket.click();
const ticketstatus1= this.pendingforResolutionStatus;
await expect(ticketstatus1).toBeVisible();
await this.takeActionbutton1.click();
await this.sendbackbutton.click();
const formheading= await this.senbackformheading;
await expect(formheading).toBeVisible();
await this.sendbackreasondropdown.click();
await this.sendbackreasondropdown.fill("Incorrectly Assigned");
await this.page.getByText("Incorrectly Assigned",{exact: true}).click();
await this.finalsendbackbutton.click();
const sendbacksuccesstoast= await this.successtoast;
await expect(sendbacksuccesstoast).toBeVisible();
await this.page.screenshot({ path: 'Screenshot/Sendbackticket.png' });
}


async Out_Of_Warranty_Ticket(outofwarrantyreason)
{

await this.inboxOption.click();
await this.page.waitForTimeout(2000)
await this.Topappearedticket.click();
await this.takeActionbutton1.click();
await this.outOfWarranty.click();
const formheadingOUtofwarranty= await this.outofwarrantyformheading;
await expect(formheadingOUtofwarranty).toBeVisible();
await this.outofwarrantyComment.fill(outofwarrantyreason);

const fileChooserPromise = this.page.waitForEvent("filechooser");
        await this.page.locator("(//div[contains(text(),'Upload')])[1]").click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(path.join("./fileUploads", "selco2.png"));

await this.page.waitForTimeout(2000);
       
await this.outofwarrantyBUtton.click();
await this.page.screenshot({path: 'Screenshot/outofwarranty.png'})

}

async ResolveOutOfWarrantyTicket()
{
await this.inboxOption.click();
// await this.outofwarrantypendingResolutionfilter.click();
// await expect(this.tableheading).toBeVisible();
await this.Topappearedticket.click();
await this.takeActionbutton1.click();
await this.resolvebutton.click();
await this.Commentbox1.fill("resolved");
const fileChooserPromise= this.page.waitForEvent("filechooser");
await this.page.locator("(//div[contains(text(),'Upload')])[1]").click();
const fileChooser= await fileChooserPromise;
await fileChooser.setFiles(path.join("./fileUploads", "selco2.png"))
await this.finalResolvebutton.click();
await this.page.screenshot({path: 'Screenshot/outofwarrantyResolve.png'})
}



async logout_Vendor(ExpectedloginURL)
     {
         
         await this.logoutbutton.click();
         await this.logoutOption.click();
         await this.page.waitForSelector("(//h1[normalize-space()='Logout'])[1]");
         await this.logoutconfirm.click();
         await expect(this.page).toHaveURL(ExpectedloginURL);
         await this.ContinueBUtton.click(); 
      }


}