import { test as setup } from '@playwright/test';
import 'dotenv/config';
import { loginToKibana } from '../utils/login.js';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await loginToKibana(page, {
    baseUrl: process.env.KIBANA_BASE_URL,
    username: process.env.KIBANA_USERNAME,
    password: process.env.KIBANA_PASSWORD,
  });
  await page.context().storageState({ path: authFile });
});
