/**
 * Runs a raw Elasticsearch aggregation through Kibana's internal search proxy
 * (/internal/search/es). This account has no dev_tools privilege (the
 * /api/console/proxy endpoint returns 403), but this endpoint is what
 * Discover/Lens use under the hood and is reachable with ordinary index
 * read access — so it gives an ES-level source of truth independent of
 * the dashboard's own TSVB/Lens rendering.
 */
export async function kibanaEsSearch(request, baseUrl, index, body) {
  const res = await request.post(`${baseUrl}/internal/search/es`, {
    headers: {
      'kbn-xsrf': 'true',
      'Content-Type': 'application/json',
      'elastic-api-version': '1',
    },
    data: { params: { index, body } },
  });
  if (!res.ok()) {
    throw new Error(`Kibana ES search failed (${res.status()}): ${await res.text()}`);
  }
  const json = await res.json();
  return json.rawResponse;
}

export async function getSavedObject(request, baseUrl, type, id) {
  const res = await request.get(`${baseUrl}/api/saved_objects/${type}/${id}`, {
    headers: { 'kbn-xsrf': 'true' },
  });
  if (!res.ok()) {
    throw new Error(`Saved object fetch failed (${res.status()}): ${await res.text()}`);
  }
  return res.json();
}
