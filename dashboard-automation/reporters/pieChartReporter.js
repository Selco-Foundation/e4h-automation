import fs from 'fs';
import path from 'path';

const STATUS_COLOR = {
  passed: '#0ca30c',
  failed: '#d03b3b',
  timedOut: '#d03b3b',
  interrupted: '#d03b3b',
  skipped: '#898781',
};
const STATUS_LABEL = {
  passed: 'Passed',
  failed: 'Failed',
  timedOut: 'Failed',
  interrupted: 'Failed',
  skipped: 'Skipped',
};

function buildDonutSvg(counts, total) {
  const r = 90;
  const strokeWidth = 36;
  const circumference = 2 * Math.PI * r;
  let offsetSoFar = 0;
  const order = ['passed', 'failed', 'skipped'];

  const segments = order
    .filter((key) => counts[key] > 0)
    .map((key) => {
      const value = counts[key];
      const fraction = value / total;
      const dash = fraction * circumference;
      const segment = {
        key,
        color: STATUS_COLOR[key],
        label: STATUS_LABEL[key],
        value,
        pct: Math.round(fraction * 1000) / 10,
        dasharray: `${dash} ${circumference - dash}`,
        dashoffset: -offsetSoFar,
        midAngle: (offsetSoFar / circumference) * 360 + (fraction * 360) / 2,
      };
      offsetSoFar += dash;
      return segment;
    });

  const labelRadius = r + strokeWidth / 2 + 22;
  const rings = segments
    .map(
      (s) => `
    <circle
      r="${r}" cx="120" cy="120" fill="none"
      stroke="${s.color}" stroke-width="${strokeWidth}"
      stroke-dasharray="${s.dasharray}" stroke-dashoffset="${s.dashoffset}"
      transform="rotate(-90 120 120)" stroke-linecap="butt"
    >
      <title>${s.label}: ${s.value} (${s.pct}%)</title>
    </circle>`
    )
    .join('');

  const labels = segments
    .map((s) => {
      const angleRad = ((s.midAngle - 90) * Math.PI) / 180;
      const x = 120 + labelRadius * Math.cos(angleRad);
      const y = 120 + labelRadius * Math.sin(angleRad);
      if (s.pct < 6) return '';
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="segment-label">${s.pct}%</text>`;
    })
    .join('');

  const passRate = total > 0 ? Math.round((counts.passed / total) * 1000) / 10 : 0;

  return { svg: `
  <svg viewBox="0 0 240 240" width="240" height="240" role="img" aria-label="Test result breakdown">
    ${rings}
    ${labels}
    <text x="120" y="112" text-anchor="middle" class="center-total">${total}</text>
    <text x="120" y="134" text-anchor="middle" class="center-caption">tests · ${passRate}% pass</text>
  </svg>`, segments };
}

export default class PieChartReporter {
  constructor() {
    this.results = [];
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.titlePath().slice(1).join(' › '),
      status: result.status,
      duration: result.duration,
      file: test.location?.file ? path.basename(test.location.file) : '',
    });
  }

  onEnd() {
    const counts = { passed: 0, failed: 0, skipped: 0 };
    for (const r of this.results) {
      if (r.status === 'passed') counts.passed++;
      else if (r.status === 'skipped') counts.skipped++;
      else counts.failed++; // failed, timedOut, interrupted
    }
    const total = this.results.length;
    const { svg, segments } = buildDonutSvg(counts, total);

    const legendRows = segments
      .map(
        (s) => `
      <div class="legend-row">
        <span class="swatch" style="background:${s.color}"></span>
        <span class="legend-label">${s.label}</span>
        <span class="legend-count">${s.value}</span>
        <span class="legend-pct">${s.pct}%</span>
      </div>`
      )
      .join('');

    const tableRows = this.results
      .map((r) => {
        const color = STATUS_COLOR[r.status] || STATUS_COLOR.skipped;
        const label = STATUS_LABEL[r.status] || r.status;
        return `
      <tr>
        <td><span class="dot" style="background:${color}"></span>${label}</td>
        <td>${escapeHtml(r.title)}</td>
        <td class="num">${(r.duration / 1000).toFixed(1)}s</td>
      </tr>`;
      })
      .join('');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Validation summary</title>
<style>
  :root {
    --surface: #fcfcfb;
    --plane: #f9f9f7;
    --ink: #0b0b0b;
    --ink-secondary: #52514e;
    --ink-muted: #898781;
    --gridline: #e1e0d9;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --surface: #1a1a19;
      --plane: #0d0d0d;
      --ink: #ffffff;
      --ink-secondary: #c3c2b7;
      --ink-muted: #898781;
      --gridline: #2c2c2a;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--plane);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    padding: 32px 16px;
  }
  .wrap { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0 0 24px; }
  .card {
    background: var(--surface);
    border: 1px solid var(--gridline);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .chart-row { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
  .segment-label { font-size: 12px; fill: var(--ink); font-weight: 600; }
  .center-total { font-size: 34px; font-weight: 700; fill: var(--ink); }
  .center-caption { font-size: 11px; fill: var(--ink-muted); }
  .legend { display: flex; flex-direction: column; gap: 10px; }
  .legend-row { display: grid; grid-template-columns: 14px 90px 40px auto; align-items: center; gap: 8px; font-size: 14px; }
  .swatch, .dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
  .dot { margin-right: 8px; vertical-align: middle; }
  .legend-label { color: var(--ink-secondary); }
  .legend-count { font-weight: 600; }
  .legend-pct { color: var(--ink-muted); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--gridline); }
  th { color: var(--ink-muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  td.num, th.num { text-align: right; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Dashboard validation summary</h1>
    <div class="card">
      <div class="chart-row">
        ${svg}
        <div class="legend">${legendRows}</div>
      </div>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Status</th><th>Check</th><th class="num">Duration</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

    const outDir = 'playwright-report';
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, 'validation-summary.html');
    fs.writeFileSync(outFile, html);
    console.log(`\nValidation summary chart: ${path.resolve(outFile)}`);
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
