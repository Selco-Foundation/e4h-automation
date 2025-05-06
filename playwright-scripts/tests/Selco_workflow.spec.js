import { test, expect } from "@playwright/test";
const fs = require('fs');
const path = require('path');
const users = require('/home/bhcp0174/Downloads/Saura-eMitra_PLAYWRIGHT_AUTOMATION_FINAL/User.json');
import { LOGINPAGE } from "../PAGES/LOGINPAGE";

import { HCR_FUNCTIONALITY } from "../PAGES/HCR_Module";
import { CRM_Module } from "../PAGES/CRM_Module";
import { Vendor_Module } from "../PAGES/Vendor_Module";

test("loginpagetest", async ({ page }) => {
  test.setTimeout(120000);
  const loginpage = new LOGINPAGE(page);
  const HCRpage = new HCR_FUNCTIONALITY(page);
  const CRMpage= new CRM_Module(page);
  const Vendorpage =new Vendor_Module(page);

  await page.goto("/digit-ui/employee/user/login");
  await loginpage.login(users.HCR.username, users.HCR.password, users.HCR.center);
  await loginpage.verifyURL("https://saura-emitra-uat.selcofoundation.org/digit-ui/employee");
  await loginpage.isTextPresent("TENANT_TENANTS_PG_DUMMY");

  let Ticketnumber = await HCRpage.Ticket_Creation("Battery","Acid Leakage","Test Comment");
  await HCRpage.Success_Confirmation("Ticket Submitted");
  await HCRpage.Goto_HOME();
  await HCRpage.Searchticket(Ticketnumber);
  await HCRpage.Status_functionality();
  await HCRpage.logo_validation();
  await HCRpage.logout("https://saura-emitra-uat.selcofoundation.org/digit-ui/employee/user/language-selection");

  await CRMpage.CRM_Login(users.CRM.username, users.CRM.password, users.CRM.center);
  await CRMpage.isTextPresentCRM("Tickets");
  await CRMpage.SearchticketCRM();
  let Ticketnumber1= await CRMpage.CRM_Ticket_Creation("Raichur","Raichur","Chandrabanda Primary Health Centre","Battery","Acid Leakage","test comment");
  await CRMpage.CRM_ticket_Rejection(Ticketnumber1);
  await CRMpage.logout_CRM("https://saura-emitra-uat.selcofoundation.org/digit-ui/employee/user/language-selection");
  
  await Vendorpage.Vendor_Login(users.vendor.username, users.vendor.password, users.vendor.center);
  await Vendorpage.Resolve_Ticket();
  await Vendorpage.Sendbackticket();




});
