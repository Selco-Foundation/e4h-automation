# Build from the dashboard-automation/ directory:
#   docker build . -t selcohub/e4h-dashboard-automation-cron:<tag>
#
# Slim base + Chromium only (the config only uses the chromium project), instead of
# the full Playwright image which bundles Chromium, Firefox and WebKit.
FROM node:22-bookworm-slim

ENV CI=true \
    npm_config_update_notifier=false \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY package.json package-lock.json ./
# Playwright is a devDependency and is needed at runtime, so keep dev deps.
# Installs the headless Chromium shell plus its OS deps, then drops apt caches.
RUN npm ci --include=dev \
    && npx playwright install --with-deps --only-shell chromium \
    && rm -rf /var/lib/apt/lists/* /root/.npm

COPY --chown=node:node playwright.config.js ./
COPY --chown=node:node tests ./tests
COPY --chown=node:node utils ./utils
COPY --chown=node:node reporters ./reporters
COPY --chown=node:node data ./data

# Output dirs must be writable by the non-root user (also when mounted as emptyDir).
RUN mkdir -p playwright-report test-results playwright/.auth \
    && chown -R node:node /app

# Non-root user shipped with the node image.
USER node

CMD ["npx", "playwright", "test"]
