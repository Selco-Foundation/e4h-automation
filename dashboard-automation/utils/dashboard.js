/**
 * @param {{from: string, to: string}} [time] - Kibana global time range (e.g. { from: 'now-10y', to: 'now' }).
 *   Pass this for dashboards whose index pattern has a time field and isn't
 *   set to timeRestore, since otherwise the displayed numbers depend on
 *   whatever time range the browser/session last had selected and any
 *   ES-side comparison query won't line up with what's on screen.
 */
export async function openDashboard(page, baseUrl, dashboardId, { time, timeout = 30_000 } = {}) {
  const globalState = time ? `?_g=(time:(from:${time.from},to:${time.to}))` : '';
  await page.goto(`${baseUrl}/app/dashboards#/view/${dashboardId}${globalState}`, {
    waitUntil: 'networkidle',
    timeout,
  });
}

/**
 * A displayed 0 is treated as a failure, not a legitimate reading: on these
 * dashboards a genuine 0 is indistinguishable from a panel that silently
 * failed to load/query (e.g. a broken filter or field reference), so it's
 * safer to flag it loudly than to let it slip through as a coincidental
 * match against an equally-broken expected value.
 */
function assertNonZero(value, panelTitle) {
  if (value === 0) {
    throw new Error(`Panel "${panelTitle}" displayed 0 - treating this as a failure (see assertNonZero in utils/dashboard.js)`);
  }
  return value;
}

/**
 * Reads the big number off a TSVB "metric" panel by its visible title.
 * Waits for the panel's own render-complete flag first, since some panels
 * (e.g. terms+top_hits aggregations) can take several seconds longer than
 * others on first load.
 */
export async function readMetricPanelValue(page, panelTitle, { timeout = 30_000 } = {}) {
  const panel = page.locator('[data-test-subj="embeddablePanel"]', { hasText: panelTitle }).first();
  await panel.locator('[data-render-complete="true"]').first().waitFor({ timeout });
  const text = await panel.locator('[data-test-subj="tsvbMetricValue"]').first().innerText({ timeout: 5_000 });
  return assertNonZero(parseFloat(text.replace(/,/g, '')), panelTitle);
}

/**
 * Reads the big number off a Lens "metric" panel by its visible title.
 * Same idea as readMetricPanelValue, but Lens metric visualizations render
 * their value under data-test-subj="metric_value" instead of tsvbMetricValue.
 */
export async function readLensMetricPanelValue(page, panelTitle, { timeout = 30_000 } = {}) {
  const panel = page.locator('[data-test-subj="embeddablePanel"]', { hasText: panelTitle }).first();
  await panel.locator('[data-render-complete="true"]').first().waitFor({ timeout });
  const text = await panel.locator('[data-test-subj="metric_value"]').first().innerText({ timeout: 5_000 });
  return assertNonZero(parseFloat(text.replace(/,/g, '')), panelTitle);
}
