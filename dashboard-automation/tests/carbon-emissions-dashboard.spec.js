import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { openDashboard, readMetricPanelValue } from '../utils/dashboard.js';
import { kibanaEsSearch } from '../utils/kibanaSearch.js';

const BASE_URL = process.env.KIBANA_BASE_URL;
const DASHBOARD_ID = '723188d0-5a92-11f1-9378-99154e33eec5';
const INDEX = 'co2-monthly-facility-index*,co2-monthly-projection-facility-index*';

test.beforeEach(async ({ page }) => {
  await openDashboard(page, BASE_URL, DASHBOARD_ID);
});

test('Number of Health Centres matches distinct facility count in Elasticsearch', async ({ page, request }) => {
  const displayed = await readMetricPanelValue(page, 'Number of Health Centres');
  const es = await kibanaEsSearch(request, BASE_URL, INDEX, {
    size: 0,
    aggs: { facility_count: { cardinality: { field: 'Data.facilityId.keyword' } } },
  });
  expect(displayed).toBe(es.aggregations.facility_count.value);
});

test('Cumulative CO2 Emissions Avoided to Date matches sum(co2EmissionsAvoidedInTonnes)', async ({ page, request }) => {
  const displayed = await readMetricPanelValue(page, 'Cumulative CO₂ Emissions Avoided to Date');
  const es = await kibanaEsSearch(request, BASE_URL, INDEX, {
    size: 0,
    aggs: { total: { sum: { field: 'co2EmissionsAvoidedInTonnes' } } },
  });
  expect(displayed).toBeCloseTo(es.aggregations.total.value, 2);
});

test('Cumulative 20-Year Projected Emissions Avoided matches sum(actual) + sum(projected)', async ({ page, request }) => {
  const displayed = await readMetricPanelValue(page, 'Cumulative 20-Year Projected Emissions Avoided');
  const es = await kibanaEsSearch(request, BASE_URL, INDEX, {
    size: 0,
    aggs: {
      actual: { sum: { field: 'co2EmissionsAvoidedInTonnes' } },
      projected: { sum: { field: 'projectedCo2EmissionsAvoidedInTonnes' } },
    },
  });
  const expected = es.aggregations.actual.value + es.aggregations.projected.value;
  expect(displayed).toBeCloseTo(expected, 2);
});

test('Total Solar Capacity matches sum of each facility\'s latest reading', async ({ page, request }) => {
  const displayed = await readMetricPanelValue(page, 'Total Solar Capacity in kWp', { timeout: 45_000 });
  const es = await kibanaEsSearch(request, BASE_URL, INDEX, {
    size: 0,
    aggs: {
      by_facility: {
        terms: { field: 'Data.facilityId.keyword', size: 10_000 },
        aggs: {
          latest: {
            top_hits: {
              size: 1,
              sort: [{ solarInstallationDate: { order: 'desc' } }],
              _source: ['solarSystemCapacity'],
            },
          },
        },
      },
    },
  });
  const buckets = es.aggregations.by_facility.buckets;
  expect(es.aggregations.by_facility.sum_other_doc_count).toBe(0); // otherwise size:10_000 truncated facilities
  const expected = buckets.reduce((total, b) => {
    const val = b.latest.hits.hits[0]?._source?.solarSystemCapacity;
    return typeof val === 'number' ? total + val : total;
  }, 0);
  expect(displayed).toBeCloseTo(expected, 2);
});

// This documents a real, currently-failing check: "Number of Health Centres"
// and "Number of Solar Systems" are configured with the exact same aggregation
// (cardinality of Data.facilityId.keyword), so they always render the same
// number. Left failing on purpose until the "Number of Solar Systems" panel
// is repointed at its own field.
test('Number of Solar Systems is a distinct metric from Number of Health Centres', async ({ page }) => {
  const healthCentres = await readMetricPanelValue(page, 'Number of Health Centres');
  const solarSystems = await readMetricPanelValue(page, 'Number of Solar Systems');
  expect(solarSystems).not.toBe(healthCentres);
});
