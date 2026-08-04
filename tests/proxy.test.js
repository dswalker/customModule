const test = require('node:test');
const assert = require('node:assert/strict');

test('resolveCustomModuleManifestPath handles IZ manifest requests and ignores central package manifests', async () => {
  const { resolveCustomModuleManifestPath, isCustomModuleAssetManifestRequest, shouldProxyLandingPageAssetRequest } = await import('../proxy/proxy-utils.mjs');

  const manifestPath = resolveCustomModuleManifestPath('/custom/TEST_INST-TEST_VIEW/asset-manifest.json', 'dist/custom-module');
  assert.equal(manifestPath, 'dist/custom-module/asset-manifest.json');

  const centralManifestPath = resolveCustomModuleManifestPath('/custom/TEST_NZ-CENTRAL_PACKAGE/asset-manifest.json', 'dist/custom-module');
  assert.equal(centralManifestPath, null);

  assert.equal(isCustomModuleAssetManifestRequest('/custom/TEST_INST-TEST_VIEW/asset-manifest.json'), true);
  assert.equal(isCustomModuleAssetManifestRequest('/custom/TEST_NZ-CENTRAL_PACKAGE/asset-manifest.json'), false);
  assert.equal(isCustomModuleAssetManifestRequest('/custom/TEST_INST-TEST_VIEW/CENTRAL_CODE.txt'), false);
  assert.equal(isCustomModuleAssetManifestRequest('/custom/TEST_INST-TEST_VIEW/assets/example.png'), false);

  assert.equal(shouldProxyLandingPageAssetRequest('/custom/TEST_INST-TEST_VIEW/assets/landingpage/icon.svg'), true);
  assert.equal(shouldProxyLandingPageAssetRequest('/nde/custom/TEST_INST-TEST_VIEW/assets/landingpage/search.svg'), true);
  assert.equal(shouldProxyLandingPageAssetRequest('/custom/TEST_INST-TEST_VIEW/assets/main.js'), false);
});
