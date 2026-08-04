import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { PROXY_TARGET } from './proxy.const.mjs';

// Added deepMerge utility to retain unspecified fields
export function deepMerge(target, source) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return source;

  const out = Array.isArray(target) ? [...target] : { ...target };

  for (const [k, v] of Object.entries(source)) {
    if (Array.isArray(v) && ['files', 'directories'].includes(k)) {
      const existing = Array.isArray(out[k]) ? out[k] : [];
      const mergedArray = [...new Set([...existing, ...v])];
      out[k] = mergedArray;
      continue;
    }

    if (v && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object' && out[k] !== null && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }

  return out;
}

function parseBuildSettingsEnv(envFilePath = path.resolve(process.cwd(), 'build-settings.env')) {
  if (!fs.existsSync(envFilePath)) {
    return {};
  }

  const content = fs.readFileSync(envFilePath, 'utf8');
  const parsed = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    parsed[key] = value;
  }

  return parsed;
}

export function getCustomModuleManifestRoot() {
  const env = parseBuildSettingsEnv();
  if (env.INST_ID && env.VIEW_ID) {
    return path.resolve(process.cwd(), 'dist', `${env.INST_ID}-${env.VIEW_ID}`);
  }

  return path.resolve(process.cwd(), 'dist', 'custom-module');
}

export function isCustomModuleAssetManifestRequest(requestPath) {
  const normalizedPath = (requestPath || '').split('?')[0].replace(/^\/+/, '/');
  const match = normalizedPath.match(/^\/(?:nde\/)?custom\/([^/]+)\/asset-manifest\.json$/);

  if (!match) {
    return false;
  }

  return !match[1].endsWith('-CENTRAL_PACKAGE');
}

export function shouldProxyLandingPageRequest(requestPath) {
  const normalizedPath = (requestPath || '').split('?')[0].replace(/^\/+/, '/');
  return normalizedPath === '/nde/home' || normalizedPath === '/home';
}

export function shouldProxyLandingPageAssetRequest(requestPath) {
  const normalizedPath = (requestPath || '').split('?')[0].replace(/^\/+/, '/');
  return /^\/(?:nde\/)?custom\/[^/]+\/assets\/landingpage(?:\/|$)/.test(normalizedPath);
}

export function resolveCustomModuleManifestPath(requestPath, buildRoot = getCustomModuleManifestRoot()) {
  if (!isCustomModuleAssetManifestRequest(requestPath)) {
    return null;
  }
  return path.join(buildRoot, 'asset-manifest.json').split(path.sep).join('/');
}

export function buildMergedManifestResponse(requestPath, localManifestPath, targetBaseUrl = PROXY_TARGET) {
  const normalizedRequestPath = (requestPath || '').split('?')[0];
  const targetManifestUrl = new URL(normalizedRequestPath.replace(/^\/+/, '/'), targetBaseUrl);
  const targetManifestUrlString = targetManifestUrl.toString();
  const localManifestPathResolved = path.resolve(localManifestPath);

  console.log(`[manifest] requestPath=${requestPath}`);
  console.log(`[manifest] targetUrl=${targetManifestUrlString}`);
  console.log(`[manifest] localManifestPath=${localManifestPathResolved}`);

  return new Promise((resolve, reject) => {
    const transport = targetManifestUrl.protocol === 'https:' ? https : http;
    const request = transport.get(targetManifestUrlString, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        console.log(`[manifest] target manifest response status=${response.statusCode}`);
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300 && body) {
          try {
            const targetManifest = JSON.parse(body);
            const localManifest = fs.existsSync(localManifestPathResolved)
              ? JSON.parse(fs.readFileSync(localManifestPathResolved, 'utf8'))
              : { files: [], directories: [] };
            console.log('[manifest] target manifest read successfully');
            console.log('[manifest] local manifest read successfully');
            const mergedManifest = deepMerge(targetManifest, localManifest);
            console.log('[manifest] merged manifest payload=', JSON.stringify(mergedManifest, null, 2));
            resolve({
              statusCode: 200,
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(mergedManifest),
            });
          } catch (error) {
            reject(error);
          }
          return;
        }

        console.log('[manifest] target manifest unavailable or empty, falling back to local manifest');
        if (fs.existsSync(localManifestPathResolved)) {
          try {
            const localManifest = JSON.parse(fs.readFileSync(localManifestPathResolved, 'utf8'));
            console.log('[manifest] local manifest fallback payload=', JSON.stringify(localManifest, null, 2));
            resolve({
              statusCode: 200,
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(localManifest),
            });
          } catch (error) {
            reject(error);
          }
          return;
        }

        resolve({
          statusCode: 404,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ error: `Manifest not found at ${localManifestPathResolved}` }),
        });
      });
    });

    request.on('error', (error) => {
      console.log(`[manifest] target manifest request failed: ${error.message}`);
      if (fs.existsSync(localManifestPathResolved)) {
        try {
          const localManifest = JSON.parse(fs.readFileSync(localManifestPathResolved, 'utf8'));
          console.log('[manifest] local manifest fallback payload=', JSON.stringify(localManifest, null, 2));
          resolve({
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(localManifest),
          });
          return;
        } catch (readError) {
          reject(readError);
        }
        return;
      }

      reject(error);
    });
  });
}
