export async function loginToKibana(page, { baseUrl, username, password }) {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.fill('[data-test-subj="loginUsername"]', username);
  await page.fill('[data-test-subj="loginPassword"]', password);
  await page.click('[data-test-subj="loginSubmit"]');
  await page.waitForURL(/\/app\//, { timeout: 30_000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}
