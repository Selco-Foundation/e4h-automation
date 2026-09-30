import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { openDashboard, readLensMetricPanelValue } from '../utils/dashboard.js';
import { kibanaEsSearch } from '../utils/kibanaSearch.js';
import { readBaseline, writeBaseline } from '../utils/ticketCountBaseline.js';

const BASE_URL = process.env.KIBANA_BASE_URL;
const DASHBOARD_ID = '2409f380-21c2-11f1-9029-3b99d02a9f86';

const HF_INDEX = 'health-facility-index*'; // no time field: not affected by the global time range
const VISIT_INDEX = 'scheduled-visit-index*'; // time field: Data.scheduledDate

// Matches the dashboard's default global time range ("Last 10 years"). The
// dashboard itself doesn't pin a time range (timeRestore: false), so it's set
// explicitly here to keep the displayed numbers and the ES comparison
// queries looking at the same window. Only affects panels built on
// VISIT_INDEX - HF_INDEX has no time field, so its panels are unaffected by
// the time range regardless of what's picked.
const TIME_RANGE = { from: 'now-10y', to: 'now' };

// Kibana runtime field (defined on the index patterns backing these panels)
// that normalizes facility identity across the two differently-shaped
// indices: keyword Data.facilityId.keyword on health-facility-index docs,
// keyword Data.facilityId on scheduled-visit-index docs. Declared here via
// runtime_mappings so the raw ES query resolves it the same way Kibana does.
const FACILITY_ID_RUNTIME = {
  facility_id: {
    type: 'keyword',
    script: {
      source:
        "if (doc['_index'].value.startsWith('health-facility-index')) { if (doc['Data.facilityId.keyword'].size() > 0) { emit(doc['Data.facilityId.keyword'].value); } } else if (doc['_index'].value.startsWith('scheduled-visit-index')) { if (doc['Data.facilityId'].size() > 0) { emit(doc['Data.facilityId'].value); } }",
    },
  },
};

// visitDays is likewise a Kibana runtime field: days between a scheduled AMC
// visit and when it actually happened.
const VISIT_DAYS_RUNTIME = {
  visitDays: {
    type: 'long',
    script: {
      source:
        "if (doc['Data.scheduledDate'].size() > 0 && doc['Data.actualVisitDate'].size() > 0) { emit((doc['Data.actualVisitDate'].value.toInstant().toEpochMilli() - doc['Data.scheduledDate'].value.toInstant().toEpochMilli()) / 86400000L); }",
    },
  },
};

test.beforeEach(async ({ page }) => {
  // This dashboard has 26 panels (vs. a handful on the others), so it
  // occasionally needs longer than the 30s default to reach networkidle.
  await openDashboard(page, BASE_URL, DASHBOARD_ID, { time: TIME_RANGE, timeout: 60_000 });
});

async function hfCount(request, query) {
  const es = await kibanaEsSearch(request, BASE_URL, HF_INDEX, { size: 0, query });
  return es.hits.total;
}

test('Total HFs with DRE Installed matches total facility count', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Total HFs with DRE Installed');
  const expected = await hfCount(request, { match_all: {} });
  expect(displayed).toBe(expected);
});

const HF_TOTAL_BASELINE_KEY = 'hf-total-with-dre-installed';
// Day-to-day drift of a few facilities (2-3) is normal. A drop bigger than
// this, as a percentage of the last recorded run, points to an upstream data
// issue (re-indexing, a broken sync, facilities silently dropped from the
// index) rather than expected fluctuation.
const HF_DROP_TOLERANCE_PCT = 1;

/**
 * Total HFs with DRE Installed is the base facility count everything else on
 * this dashboard is measured against. It naturally drifts by a handful of
 * facilities run to run, but a drastic drop is a sign of a dashboard/data
 * issue, so it's flagged here rather than left to surface later as confusing
 * mismatches in the other panel checks.
 */
test('Total HFs with DRE Installed does not drop drastically from the last recorded run', async ({ page }) => {
  const displayed = await readLensMetricPanelValue(page, 'Total HFs with DRE Installed');
  const previous = readBaseline(HF_TOTAL_BASELINE_KEY);

  if (previous !== null && displayed < previous) {
    const dropPct = ((previous - displayed) / previous) * 100;
    if (dropPct > HF_DROP_TOLERANCE_PCT) {
      throw new Error(
        `Dashboard issue detected: "Total HFs with DRE Installed" dropped from ${previous} (previous run) to ${displayed} (this run), a ${dropPct.toFixed(2)}% decrease. Drops greater than ${HF_DROP_TOLERANCE_PCT}% are treated as a data issue, not normal day-to-day fluctuation.`,
      );
    }
  }

  writeBaseline(HF_TOTAL_BASELINE_KEY, displayed);
});

test('HFs with Non-Functional DRE System matches solar_panel_status: NON_FUNCTIONAL', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'HFs with Non-Functional DRE System');
  const expected = await hfCount(request, { term: { 'Data.solar_panel_status': 'NON_FUNCTIONAL' } });
  expect(displayed).toBe(expected);
});

test('HFs with Functional DRE Systems matches solar_panel_status: FUNCTIONAL', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'HFs with Functional DRE Systems');
  const expected = await hfCount(request, { term: { 'Data.solar_panel_status': 'FUNCTIONAL' } });
  expect(displayed).toBe(expected);
});

test('HFs with Reported Tickets matches total_tickets > 0', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'HFs with Reported Tickets');
  const expected = await hfCount(request, { range: { 'Data.total_tickets': { gt: 0 } } });
  expect(displayed).toBe(expected);
});

test('HFs with Open Tickets matches open_tickets > 0', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'HFs with Open Tickets');
  const expected = await hfCount(request, { range: { 'Data.open_tickets': { gt: 0 } } });
  expect(displayed).toBe(expected);
});

test('HFs with Closed Tickets matches closed_tickets > 0 and open_tickets = 0', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'HFs with Closed Tickets Closed');
  const expected = await hfCount(request, {
    bool: { filter: [{ range: { 'Data.closed_tickets': { gt: 0 } } }, { term: { 'Data.open_tickets': 0 } }] },
  });
  expect(displayed).toBe(expected);
});

test('AMC Completion % matches count(status: APPROVED) / count() in time range', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'AMC Completion %');
  const timeFilter = { range: { 'Data.scheduledDate': { gte: TIME_RANGE.from, lte: TIME_RANGE.to } } };
  const total = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, { size: 0, query: { bool: { filter: [timeFilter] } } });
  const approved = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, {
    size: 0,
    query: { bool: { filter: [timeFilter, { term: { 'Data.status': 'APPROVED' } }] } },
  });
  const expected = (approved.hits.total / total.hits.total) * 100;
  expect(displayed).toBeCloseTo(expected, 2);
});

test('AMC Applicable Facilities matches unique visited facilities / unique total facilities', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'AMC Applicable Facilities');
  const visited = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, {
    size: 0,
    runtime_mappings: FACILITY_ID_RUNTIME,
    aggs: { u: { cardinality: { field: 'facility_id' } } },
  });
  const allFacilities = await kibanaEsSearch(request, BASE_URL, HF_INDEX, {
    size: 0,
    runtime_mappings: FACILITY_ID_RUNTIME,
    aggs: { u: { cardinality: { field: 'facility_id' } } },
  });
  const expected = (visited.aggregations.u.value / allFacilities.aggregations.u.value) * 100;
  expect(displayed).toBeCloseTo(expected, 2);
});

test('Lapsed AMC % matches count(status: EXPIRED) / count() in time range', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Lapsed AMC %');
  const timeFilter = { range: { 'Data.scheduledDate': { gte: TIME_RANGE.from, lte: TIME_RANGE.to } } };
  const total = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, { size: 0, query: { bool: { filter: [timeFilter] } } });
  const expired = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, {
    size: 0,
    query: { bool: { filter: [timeFilter, { term: { 'Data.status': 'EXPIRED' } }] } },
  });
  const expected = (expired.hits.total / total.hits.total) * 100;
  expect(displayed).toBeCloseTo(expected, 2);
});

test('Delayed AMC % matches count(visitDays > 30 and status in pending/approved set) / count()', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Delayed AMC %');
  const timeFilter = { range: { 'Data.scheduledDate': { gte: TIME_RANGE.from, lte: TIME_RANGE.to } } };
  const total = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, { size: 0, query: { bool: { filter: [timeFilter] } } });
  const delayed = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, {
    size: 0,
    runtime_mappings: VISIT_DAYS_RUNTIME,
    query: {
      bool: {
        filter: [
          timeFilter,
          { range: { visitDays: { gt: 30 } } },
          { terms: { 'Data.status': ['PENDING_OTP_APPROVAL', 'PENDING_APPROVAL', 'APPROVED'] } },
        ],
      },
    },
  });
  const expected = (delayed.hits.total / total.hits.total) * 100;
  expect(displayed).toBeCloseTo(expected, 2);
});

test('Average Delay matches avg(visitDays) where visitDays > 0 in time range', async ({ page, request }) => {
  const displayed = await readLensMetricPanelValue(page, 'Average Delay');
  const timeFilter = { range: { 'Data.scheduledDate': { gte: TIME_RANGE.from, lte: TIME_RANGE.to } } };
  const es = await kibanaEsSearch(request, BASE_URL, VISIT_INDEX, {
    size: 0,
    runtime_mappings: VISIT_DAYS_RUNTIME,
    query: { bool: { filter: [timeFilter, { range: { visitDays: { gt: 0 } } }] } },
    aggs: { avg_delay: { avg: { field: 'visitDays' } } },
  });
  expect(displayed).toBeCloseTo(es.aggregations.avg_delay.value, 2);
});
