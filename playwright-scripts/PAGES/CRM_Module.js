const {expect}= require('@playwright/test');
import * as path from "path";

exports.CRM_Module =
class CRM_Module{

constructor(page){

    this.page=page;
    this.ContinueBUtton=page.locator("//header[normalize-space()='CONTINUE']")
    this.usernameinput= page.locator("//input[@name='username']");
    this.passwordinput= page.locator("//input[@name='password']");
    this.healthcarecenterlogin= page.locator("(//input[@class='employee-select-wrap--elipses undefined'])[1]");
    this.loginbutton= page.locator("//header[normalize-space()='CONTINUE']")
    this.inboxOption=page.locator("//a[normalize-space()='Inbox']")
    this.ticketInTop=page.locator("(//td[@role='cell'])[1]")
    this.ticketResult=page.locator("(//td[@role='cell'])[1]")
    this.SearchBox=page.locator("(//input[@name='serviceRequestId'])[1]")
    this.searchButton=page.locator("(//header[normalize-space()='Search'])[1]")
    this.ticketSummary= page.locator("//header[normalize-space()='Ticket Summary'])[1]")          
    this.Takeactionbutton= page.locator("(//header[normalize-space()='Take Action'])[1]")
    this.assignform= page.locator("(//div[@class='menu-wrap'])[1]")
    this.Assignbutton= page.locator("(//p[normalize-space()='ASSIGN'])[1]")
    this.RejectButton=page.locator("(//p[normalize-space()='REJECT'])[1]")  
    this.assigndropdown=page.locator("//input[@type='text']")
    this.commentbox= page.locator("(//textarea[@name='comment'])[1]")
    this.finalAssignButton=page.locator("(//h2[normalize-space()='ASSIGN'])[1]")
    this.ticketstatus= page.locator("//p[normalize-space()='Pending Resolution']");
    this.searchedTicketresult=page.locator("//a[starts-with(normalize-space(), 'KA-RCH-')]")   
    this.succestoastforAssign= page.locator("(//div[@class='toast-success'])[1]")  
    this.Backbutton= page.locator("(//a[normalize-space()='BACK'])[1]")
    this.Newticketcreation=page.locator( "(//a[normalize-space()='New Ticket'])[1]");
    this.district=page.locator("input.employee-select-wrap--elipses.false")
    this.Block=page.locator("(//input[@type='text'])[2]")
    this.healthcarecenter=page.locator("(//input[@type='text'])[3]")
    this.Tickettype1=page.locator("//div[6]//div[1]//div[1]//div[1]//input[1]")
    this.ticket_Subtype1=page.locator("//body[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/div[1]/div[1]/div[1]/div[1]/form[1]/div[1]/div[7]/div[1]/div[1]/div[1]/input[1]")
    this.Comment1=page.locator("(//input[@name='comments'])[1]")
    this.TicketID1= page.locator("div[class='emp-success-wrap'] div p")
    this.gotohomebutton1=page.locator("(//header[normalize-space()='Go back to home page'])[1]")
    this.InboxOption1=page.locator("(//a[normalize-space()='Inbox'])[1]")
    this.successtoastmessage=page.locator("(//div[@class='toast-success'])[1]")
    this.Submitticket_Buttton=page.locator("(//header[normalize-space()='Submit Ticket'])[1]")
    this.rejectreasondropdown= page.locator("(//input[@type='text'])[1]")
    this.commentbox1=page.locator("(//textarea[@name='comment'])[1]")
    this.finalrejectbutton=page.locator("(//h2[normalize-space()='REJECT'])[1]")
    this.rejectiontoastmessage=page.locator("(//div[@class='action-bar-wrap undefined'])[1]")
    this.logoutbutton=page.locator("(//*[name()='svg'])[3]");
    this.logoutOption=page.locator("//span[contains(text(),'Logout')]")
    this.logoutconfirm= page.locator("//button[@class='selector-button-primary']")
    }

async CRM_Login(username1,password1,Healthcarecenter1)
    {
    
        await this.ContinueBUtton.click(); 
        await this.page.waitForSelector("//input[@name='username']")
        await this.usernameinput.fill(username1);
        await this.passwordinput.fill(password1);
        await this.healthcarecenterlogin.click();
        await this.page.keyboard.type(Healthcarecenter1);
        await this.page.waitForTimeout(500);
        await this.page.getByText(Healthcarecenter1, { exact: true }).click();
        await this.loginbutton.click();
        
    }
    
async isTextPresentCRM(expectedText)
     {
        const locator = await this.page.locator("//span[@class='text removeHeight']");   //Tickets
         await expect(locator).toHaveText(expectedText)
    
    }
    
    
async SearchticketCRM()
     {
    await this.inboxOption.click();
    await this.ticketInTop.waitFor();
    //put the ticket for search
    const Ticketsearch= await this.ticketInTop.textContent();
    console.log("searched ticket id ", Ticketsearch);
    await this.SearchBox.fill(Ticketsearch.trim());
    await this.searchButton.click();
    await this.page.waitForTimeout(2000); // Optional: wait for results
    //click on the apeared ticket and Assign the ticket
    await this.searchedTicketresult.click();
    await expect(this.page.locator("(//header[normalize-space()='Ticket Summary'])[1]")).toBeVisible();
    await this.Takeactionbutton.click();
    await this.Assignbutton.click();
    await expect(this.page.locator("(//h1[normalize-space()='Assign Ticket'])[1]")).toBeVisible();
    await this.assigndropdown.click();
    await this.page.keyboard.type('selcoindianew'); 
    await this.page.getByText('selcoindianew', { exact: true }).click();
    await this.commentbox.fill("Test Comment");
    await this.finalAssignButton.click();
    const successtoast= await this.successtoastmessage;
    await expect(successtoast).toBeVisible();
     }
    
    
async CRM_Ticket_Creation(districtname, blockname, healthcarecentername, Tickettype_Name1, TicketSUBtype_Name1, comments1)
      {
        await this.Backbutton.click();
        await this.Newticketcreation.click();
        // Wait for form to be ready
        await this.district.first().waitFor({ state: 'visible', timeout: 5000 });
        // District
        await this.district.first().click();
        await this.district.first().fill(districtname)
        await this.page.getByText(districtname, { exact: true }).waitFor({state:'visible'})
        await this.page.getByText(districtname, { exact: true }).click();
        //Block
        await this.page.locator('div').filter({ hasText: /^Block \* This field is required$/ }).getByRole('textbox').waitFor({state:'visible',timeout:5000})
        await this.page.locator('div').filter({ hasText: /^Block \* This field is required$/ }).getByRole('textbox').click();
        await this.page.locator('div').filter({ hasText: /^Block \* This field is required$/ }).getByRole('textbox').fill(blockname);
        await this.page.getByText(blockname, { exact: true }).click();
        //Healthcare center
        await this.healthcarecenter.click();
        await this.healthcarecenter.fill(healthcarecentername);
        await this.page.getByText(healthcarecentername, { exact: true }).click();
        // Ticket type
        await this.Tickettype1.click();
        await this.Tickettype1.fill(Tickettype_Name1);
        await this.page.getByText(Tickettype_Name1, { exact: true }).click();
        // Ticket subtype
        await this.ticket_Subtype1.click();
        await this.ticket_Subtype1.fill(TicketSUBtype_Name1);
        await this.page.getByText(TicketSUBtype_Name1, { exact: true }).click();
        // Comments
        await this.Comment1.fill(comments1);

        // Upload a file
        const fileChooserPromise = this.page.waitForEvent("filechooser");
        await this.page.locator("input.input-mirror-selector-button").click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles([
            path.join("./fileUploads", "Selcoimage.png"),
            path.join("./fileUploads", "selco2.png"),
          ]);
        
        await this.Submitticket_Buttton.click();
        // Wait for ticket ID
        await this.TicketID1.waitFor({ state: 'visible', timeout: 10000 });
        const id = await this.TicketID1.textContent();
        console.log(`Created Ticket ID: ${id}`);
        return id;
    }
    
    
async CRM_ticket_Rejection(Ticketnumber1)
     {  
    await this.gotohomebutton1.click();  
    await this.page.waitForTimeout(3000)
    await this.InboxOption1.click();  
    const locator = this.page.locator("//header[normalize-space()='Inbox']");
    await expect(locator).toBeVisible();     
    await this.SearchBox.fill(Ticketnumber1);
    await this.searchButton.click();
    await this.page.waitForTimeout(2000); // Optional: wait for results
    await this.ticketResult.waitFor();
    // Verify that the ticket appears in the inbox
    let ticketResultget= this.page.locator("td[role='cell'] div");
    await expect(ticketResultget).toBeVisible();
    await expect(ticketResultget).toContainText(Ticketnumber1);
    await ticketResultget.click();
    await this.Takeactionbutton.click();
    await this.RejectButton.click();
    await this.rejectreasondropdown.click();
    await this.rejectreasondropdown.fill("Others")
    await this.page.getByText("Others", {exact:true}).click();
    await this.commentbox1.fill("test comment");
    await this.finalrejectbutton.click();
    const rejectiontoast= this.rejectiontoastmessage;
    await expect(rejectiontoast).toBeVisible();
    await this.page.screenshot({ path: 'Screenshot/rejected.png', fullPage: true });
    
   }

   async logout_CRM(ExpectedloginURL)
   {
       
       await this.logoutbutton.click();
       await this.logoutOption.click();
       await this.page.waitForSelector("(//h1[normalize-space()='Logout'])[1]");
       await this.logoutconfirm.click();
       await expect(this.page).toHaveURL(ExpectedloginURL);
       await this.ContinueBUtton.click(); 
    }

}
