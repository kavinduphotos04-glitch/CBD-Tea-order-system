# CBD Tea Club

A friendly shared tea board for the CBD team. Open one link, choose a tea round, add your name and drink preference, and show the grouped list to tea aunty.

UI previews: [Desktop](docs/desktop-preview.png) · [Mobile](docs/mobile-preview.png). These are local screenshots, not live deployment links.

## What it does

- Responsive cream, coral, mint and lavender interface, with locally hosted fonts and an original tea illustration.
- Separate morning and afternoon rounds. A fresh board each day at midnight in **Asia/Colombo**.
- Milk tea, plain tea, milk coffee and coffee; no sugar (0 tsp), less sugar (1 tsp), or regular (2 tsp); optional preparation notes.
- Shared orders across phones and computers, refreshed every 10 seconds and when you return to the page.
- Name search, alphabetical sorting, cup totals, browser-owned order editing and cancellation.
- Large tea-aunty view grouped by drink and sugar preference, including names and notes. Print to paper or PDF from the browser.
- Share the selected tea round with the **Invite the team** button. No account or sign-up required.
- Visible loading, empty, offline, validation and save states. The app never silently substitutes a browser-only list for shared storage.

## Develop

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Vite runs both the React interface and the local API. Development orders persist in the ignored `.local/orders/` directory. Use `npm run dev` for the complete local app; `npm run preview` serves only static build assets and does not start the API.

```sh
npm test           # API validation, ownership, persistence, concurrency and Sri Lanka midnight
npm run build      # TypeScript and production build
npm run test:e2e   # Desktop/mobile workflows and automated WCAG AA checks
```

Browser tests use `/usr/bin/chromium` by default in this environment. Elsewhere, set `CHROMIUM_PATH` to an installed Chromium executable, or install a Playwright browser and adjust `playwright.config.ts`. Browser tests create and cancel synthetic orders; no demo orders are seeded into the app.

## Production architecture

**React + TypeScript + Vite → Netlify Functions → Netlify Blobs.**

`netlify.toml` defines the build, security headers and `/api/orders` routes. The Node function in `netlify/functions/orders.mjs` uses the same validated API handler as development. Production persistence uses strongly consistent, site-wide **Netlify Blobs**, not localStorage or deploy-specific storage. Orders are stored separately so simultaneous submissions from different people do not overwrite the whole list. Conditional writes prevent duplicate submissions and stale edits.

No external database account or database API key is required. Netlify supplies the Blobs context to deployed Functions. Build and deploy the **whole project**, including its function; uploading only `dist/` as a static site will not provide shared orders.

The browser stores a random order identity and optionally remembers the name. The identity permits edits to that browser’s own order and never appears in the share link. Clearing browser storage or changing devices loses those edit permissions. One browser identity can have one order per round; the same person can order in both rounds. This is a lightweight team-link app, not an authenticated staff directory: anyone with the link can read the board and submit an order. Daily reset changes which board is displayed; it does not delete earlier records from Netlify Blobs.

## Deploy to Netlify

The project is configured for Netlify, but publication requires access to your Netlify account. No live URL has been created yet.

### From your computer

```sh
npm ci
npx netlify-cli login
npx netlify-cli deploy --prod --build
```

On the first deploy, choose **Create & configure a new site**, select your team and a site name, then use the returned production URL for the CBD crew. Netlify will bundle the function and provision Blobs storage automatically. To redeploy, run the same deploy command in this checkout.

Alternatively, push the source to your GitHub repository, import that repository in Netlify, and let Netlify use the settings in `netlify.toml` (build: `npm run build`, publish: `dist`, functions: `netlify/functions`).

### From this cloud task

A requirement named `NETLIFY_AUTH_TOKEN` has been saved in environment settings, scoped to `api.netlify.com`, along with access to Netlify deployment URLs. Enter a Netlify personal access token there securely, save and publish the environment configuration, then continue this task. Do not paste credentials into chat or commit them. A configured requirement is not a supplied credential, and saving settings is separate from deploying the application.

After the token is available, use the installed CLI at `/workspace/.cbd-tools/node_modules/.bin/netlify`, create or select the intended Netlify site, and deploy with `--prod --build`. If using Node’s built-in proxy support, `NODE_USE_ENV_PROXY=1` makes API requests respect the environment’s existing HTTPS proxy. Keep TLS verification and inherited proxy settings enabled.

After publication, verify the public `/api/orders` endpoint and repeat a create → second-browser read → edit → cancel check on the actual site. Local tests alone do not establish a live deployment.

## Validation in this environment

- API: 5 tests passed, covering persisted shared orders, ownership, separate rounds, midnight rollover, invalid inputs, simultaneous submissions and storage failures.
- Browser: morning and afternoon order flows, cross-browser refresh, edits, reload persistence, search, tea-aunty display, print layout, sharing, cancellation and connection recovery passed on desktop and mobile.
- Automated accessibility: WCAG A/AA checks passed for the empty order board and share dialog on desktop and mobile. These checks supplement, rather than replace, manual accessibility review.
- Netlify local runtime: the actual Node function and Netlify Blobs adapter passed GET, POST, PUT and DELETE checks. The unused Edge Functions emulator was disabled for this check because its additional runtime download was unavailable.
- Live Netlify deployment: **pending account authentication**.
