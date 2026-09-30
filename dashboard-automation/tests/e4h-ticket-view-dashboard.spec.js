import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { openDashboard, readLensMetricPanelValue } from '../utils/dashboard.js';
import { kibanaEsSearch } from '../utils/kibanaSearch.js';
import { readBaseline, writeBaseline } from '../utils/ticketCountBaseline.js';

const BASE_URL = process.env.KIBANA_BASE_URL;
const DASHBOARD_ID = '05335ff0-8974-11f0-b3f4-7d44ca659e28';
const INDEX = 'computed-sla-im-services-updated*';
const STATUS_FIELD = 'Data.incident.applicationStatus.keyword';

// Matches the dashboard's default global time range ("Last 10 years"). The
// dashboard itself doesn't pin a time range (timeRestore: false), so it's set
// explicitly here to keep the displayed numbers and the ES comparison query
// looking at the same window.
const TIME_RANGE = { from: 'now-10y', to: 'now' };

test.beforeEach(async ({ page }) => {
  await openDashboard(page, BASE_URL, DASHBOARD_ID, { time: TIME_RANGE });
});

/**
 * Builds the ES equivalent of a ticket-status metric panel: a count of docs
 * in the dashboard's time range, optionally narrowed to (include) or
 * excluding (exclude) a set of Data.incident.applicationStatus values.
 */
async function ticketCount(request, { include, exclude } = {}) {
  const bool = {
    filter: [{ range: { 'Data.@timestamp': { gte: TIME_RANGE.from, lte: TIME_RANGE.to } } }],
  };
  if (include) bool.filter.push({ terms: { [STATUS_FIELD]: include } });
  if (exclude) bool.must_not = [{ terms: { [STATUS_FIELD]: exclude } }];

  const es = await kibanaEsSearch(request, BASE_URL, INDEX, { size: 0, query: { bool } });
  return typeof es.hits.total === 'number' ? es.hits.total : es.hits.total.value;
}

const CLOSED_STATUSES = ['RESOLVED', 'CLOSEDAFTERRESOLUTION', 'REJECTED', 'CLOSEDAFTERREJECTION'];
const TOTAL_TICKETS_BASELINE_KEY = 'e4h-total-tickets-logged';

test('Total Tickets Logged matches total document count', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Total Tickets Logged');
  const expected = await ticketCount(request);
  expect(displayed).toBe(expected);
});

/**
 * Tickets are only ever created/closed going forward, never deleted, so the
 * total should be monotonically non-decreasing run over run. A drop means
 * something upstream (re-indexing, a broken filter, data loss) silently
 * changed the dashboard's data, which is exactly the kind of issue this
 * guards against - it's flagged as a dashboard issue rather than a plain
 * assertion mismatch.
 */
test('Total Tickets Logged never drops below the last recorded run', async ({ page }) => {
  const displayed = await readLensMetricPanelValue(page, 'Total Tickets Logged');
  const previous = readBaseline(TOTAL_TICKETS_BASELINE_KEY);

  if (previous !== null && displayed < previous) {
    throw new Error(
      `Dashboard issue detected: "Total Tickets Logged" dropped from ${previous} (previous run) to ${displayed} (this run). Ticket counts should never decrease.`,
    );
  }

  if (previous === null || displayed > previous) {
    writeBaseline(TOTAL_TICKETS_BASELINE_KEY, displayed);
  }
});

test('Open Tickets matches count of non-closed statuses', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Open Tickets');
  const expected = await ticketCount(request, { exclude: CLOSED_STATUSES });
  expect(displayed).toBe(expected);
});

test('Closed Tickets matches count of closed statuses', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Closed Tickets');
  const expected = await ticketCount(request, { include: CLOSED_STATUSES });
  expect(displayed).toBe(expected);
});

test('Tickets Pending With CRM matches its status set', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Tickets Pending With CRM');
  const expected = await ticketCount(request, {
    include: ['PENDING_ASSIGNMENT_SPARE_PART_NEEDED', 'PENDINGFORASSIGNMENT', 'PENDINGFORASSIGNMENT_THEFT'],
  });
  expect(displayed).toBe(expected);
});

test('Tickets Pending With Vendors matches its status set', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Tickets Pending With Vendors');
  const expected = await ticketCount(request, {
    include: [
      'PENDINGRESOLUTION',
      'PENDING_RESOLUTION_OUT_OF_WARRANTY',
      'PENDING_RESOLUTION_SPARE_PART_NEEDED',
      'OUT_OF_SCOPE',
      'PENDING_REVISION',
      'PENDING_RESOLUTION_OUT_OF_SCOPE',
      'RMS_DEVICE_PENDINGRESOLUTION',
    ],
  });
  expect(displayed).toBe(expected);
});

test('Tickets Pending With State matches its status', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Tickets Pending With State');
  const expected = await ticketCount(request, { include: ['PENDING_ASSIGNMENT_OUT_OF_WARRANTY'] });
  expect(displayed).toBe(expected);
});

test('Tickets Pending With Tech POC matches its status set', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Tickets Pending With Tech POC');
  const expected = await ticketCount(request, {
    include: [
      'PENDINGFORASSIGNMENT_RMS_DEVICE',
      'OUT_OF_WARRANTY_PENDING_TECH_POC_ROUND_2',
      'OUT_OF_WARRANTY_PENDING_TECH_POC',
      'RMS_DEVICE_PENDING_TECH_POC',
    ],
  });
  expect(displayed).toBe(expected);
});
