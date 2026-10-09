/**
 * @param {{from: string, to: string}} [time] - Kibana global time range (e.g. { from: 'now-10y', to: 'now' }).
 *   Pass this for dashboards whose index pattern has a time field and isn't
 *   set to timeRestore, since otherwise the displayed numbers depend on
 *   whatever time range the browser/session last had selected and any
 *   ES-side comparison query won't line up with what's on screen.
 */
export async function openDashboard(page, baseUrl, dashboardId, { time, timeout = 90_000 } = {}) {
  const globalState = time ? `?_g=(time:(from:${time.from},to:${time.to}))` : '';
  await page.goto(`${baseUrl}/app/dashboards#/view/${dashboardId}${globalState}`, {
    waitUntil: 'domcontentloaded',
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
 * Shared reader for metric panels. Kibana lazy-renders panels that are off
 * screen and Lens/TSVB re-render (detaching the value node) when data
 * arrives, so a one-shot waitFor + innerText is flaky. Scroll the panel into
 * view, then poll until the value element holds a parseable number.
 */
async function readPanelNumber(page, panelTitle, valueSubj, timeout) {
  const panel = page.locator('[data-test-subj="embeddablePanel"]', { hasText: panelTitle }).first();
  const deadline = Date.now() + timeout;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      await panel.scrollIntoViewIfNeeded({ timeout: 10_000 });
      const value = panel.locator(`[data-test-subj="${valueSubj}"]`).first();
      await value.waitFor({ timeout: 10_000 });
      const text = await value.innerText({ timeout: 5_000 });
      const num = parseFloat(text.replace(/,/g, ''));
      if (!Number.isNaN(num)) return assertNonZero(num, panelTitle);
      lastErr = new Error(`Panel "${panelTitle}" value not numeric yet: "${text}"`);
    } catch (e) {
      if (e.message.includes('displayed 0')) throw e;
      lastErr = e;
    }
    await page.waitForTimeout(1_000);
  }
  throw new Error(`Panel "${panelTitle}" did not render a value within ${timeout}ms: ${lastErr?.message}`);
}

/** Reads the big number off a TSVB "metric" panel by its visible title. */
export function readMetricPanelValue(page, panelTitle, { timeout = 90_000 } = {}) {
  return readPanelNumber(page, panelTitle, 'tsvbMetricValue', timeout);
}

/**
 * Reads the big number off a Lens "metric" panel by its visible title
 * (Lens renders its value under data-test-subj="metric_value").
 */
export function readLensMetricPanelValue(page, panelTitle, { timeout = 90_000 } = {}) {
  return readPanelNumber(page, panelTitle, 'metric_value', timeout);
}
