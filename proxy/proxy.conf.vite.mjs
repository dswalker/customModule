import { PROXY_TARGET } from './proxy.const.mjs';
import { customizationConfigOverride } from './customization_config_override.mjs';
import { deepMerge } from './proxy-utils.mjs';

/**
 * The dev server itself. Used to reproduce the old webpack `router -> self host`
 * behaviour: rules that must be "served locally" are proxied back to the dev
 * server with a rewritten path, so the request re-enters the middleware stack
 * from the top and reaches Angular's asset/output-file middleware (which runs
 * BEFORE the proxy and therefore can't be reached via `bypass`).
 *
 * NOTE: keep the port in sync with angular.json ->
 *   architect > serve-original > options > "port" (currently 4201).
 */
const SELF_TARGET = `http://localhost:${process.env['NG_DEV_SERVER_PORT'] ?? 4201}`;

/**
 * Proxy configuration for the Angular `@angular/build:dev-server` builder.
 *
 * The Angular dev-server loads this file, takes its `default` export, normalizes
 * it (glob keys -> RegExp, `pathRewrite` object -> `rewrite` fn) and hands it to
 * Vite's `server.proxy` (which is powered by `http-proxy`, NOT
 * http-proxy-middleware). Because of that, the webpack-only features from the
 * old `proxy.conf.mjs` are re-expressed here with their Vite equivalents:
 *
  *  - Vite matches keys in *insertion order* and the first matching rule wins,
 *    so the local rules are declared BEFORE the catch-all. This is how the
 *    webpack `['**', '!/nde/custom/**']` negation is reproduced.
 *  - A key that starts with `^` is treated as a RegExp; Angular passes such keys
 *    through untouched. (Non-`^` glob keys would be auto-converted by Angular.)
 *  - webpack `router` returning the *same host* (i.e. "serve this locally") is
 *    reproduced by proxying back to the dev server itself (`SELF_TARGET`) with a
 *    `rewrite`. `bypass` CANNOT be used for that here because Angular's
 *    asset/output middleware runs BEFORE the proxy, so a bypass-rewritten local
 *    path would never be served (=> 404). Re-issuing to self makes the request
 *    re-enter the middleware stack from the top where those middlewares run.
 *  - webpack function-form `pathRewrite` maps to Vite `rewrite`.
 *  - webpack `onProxyRes` + `selfHandleResponse` maps to Vite `configure`
 *    with a `proxy.on('proxyRes', ...)` listener.
 *
 * Reference it from angular.json:
 *   architect > serve-original > options > "proxyConfig": "./proxy/proxy.conf.vite.mjs"
 *
 * @type {Record<string, import('vite').ProxyOptions>}
 */
export const proxy = {
  // ── Rule 1 ────────────────────────────────────────────────────────────────
  // webpack context:
  //   '/custom/*/assets', '/custom/*/assets/**',
  //   '/nde/custom/*/assets', '/nde/custom/*/assets/**'
  // Rewrite the custom-instance asset path to the local `/assets/` folder.
  // We CANNOT use `bypass` here: Angular's assets middleware runs BEFORE the
  // proxy, so a bypass-rewritten `/assets/...` url is never served (=> 404).
  // Instead we re-issue the request to the dev server itself (mirroring the old
  // webpack `router -> self host` + `pathRewrite`). The self-request re-enters
  // the middleware stack from the top, where the assets middleware serves it.
  '^/(?:nde(?:-next)?/)?custom/[^/]+/assets': {
    target: SELF_TARGET,
    changeOrigin: false,
    rewrite: (path) =>
      path.replace(/^\/(?:nde(?:-next)?\/)?custom\/[^/]+\/assets\/?/, '/assets/'),
  },

  // ── Rule 2 ────────────────────────────────────────────────────────────────
  // webpack context: '/primaws/rest/pub/configuration/vid/'
  // Proxy to the real server, intercept the JSON response and deep-merge the
  // customization override into it (retaining unspecified fields).
  '/primaws/rest/pub/configuration/vid/': {
    target: PROXY_TARGET,
    secure: true,
    changeOrigin: true,
    // Let our own listener finish the response instead of piping it through.
    selfHandleResponse: true,
    configure: (proxy) => {
      proxy.on('proxyRes', (proxyRes, req, res) => {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          try {
            const bodyStr = Buffer.concat(chunks).toString('utf8');
            const json = JSON.parse(bodyStr);
            // MERGE instead of replace to retain unspecified fields
            json.customization = deepMerge(
              json.customization || {},
              customizationConfigOverride,
            );
            const out = JSON.stringify(json);
            res.setHeader('content-type', 'application/json');
            res.end(out);
          } catch (e) {
            res.end(Buffer.concat(chunks));
          }
        });
      });
    },
  },

  // ── Rule 3 ────────────────────────────────────────────────────────────────
  // webpack context: '/nde/custom/**'
  // Strip the `/nde/custom/<...>/` prefix and serve the remaining path from the
  // dev server (webpack used `router` -> self host, pathRewrite
  // `{ '^/nde/custom/.*/': '' }`). Like Rule 1 this is re-issued to the dev
  // server itself so it reaches Angular's output-file/asset middleware. The
  // rewrite keeps a leading slash so the path is servable.
  '^/nde(?:-next)?/custom/': {
    target: SELF_TARGET,
    changeOrigin: false,
    rewrite: (path) => path.replace(/^\/nde(?:-next)?\/custom\/.*\//, '/'),
  },

  // ── Rule 4 ────────────────────────────────────────────────────────────────
  // webpack context: ['**', '!/nde/custom/**']
  // Catch-all: proxy everything else to the real server. The `!/nde/custom/**`
  // exclusion is achieved by placing this rule LAST (rules 1 & 3 already
  // consumed the `/nde/custom` traffic above).
  '^/': {
    target: PROXY_TARGET,
    secure: true,
    changeOrigin: true,
    // Do NOT proxy the dev server's own runtime requests – these must be served
    // locally for Angular/Vite HMR and module loading to work, exactly like
    // webpack-dev-server served its own runtime before the `**` proxy matched.
    bypass: (req) => {
      const url = req.url || '';
      // Do NOT serve /nde/ or /nde-next/ paths locally (except /nde/custom/
      // and /nde-next/custom/ already handled by Rule 3).
      // Only /nde/custom/ and /nde-next/custom/ paths should be served locally.
      if (url.startsWith('/nde/') || url.startsWith('/nde-next/')) {
        return; // proxy to PROXY_TARGET
      }
      if (
        url.startsWith('/@') || // /@vite/client, /@id/, /@fs/, /@ng/, /@angular/ ...
        url.startsWith('/node_modules/') ||
        url.startsWith('/.vite/') ||
        url.startsWith('/src/') ||
        url.startsWith('/__vite') ||
        url.startsWith('/ng-cli-ws') ||  // Angular dev-server websocket
        /\.[cm]?[jt]sx?(\?|$)/.test(url) || // .js/.mjs/.ts/.tsx module requests
        /\.map(\?|$)/.test(url) // sourcemaps
      ) {
        return url; // serve locally
      }
      // otherwise fall through and proxy to PROXY_TARGET
    },
  },
};

export default proxy;



